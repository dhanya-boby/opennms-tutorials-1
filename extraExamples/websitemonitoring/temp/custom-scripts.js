function ownKeys(object, enumerableOnly) {
	var keys = Object.keys(object);
	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(object);
		if (enumerableOnly) symbols = symbols.filter(function(sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; });
		keys.push.apply(keys, symbols);
	} return keys;


} function _objectSpread(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) {
			ownKeys(Object(source), true).forEach(function(key) { _defineProperty(target, key, source[key]); });
		} else if (Object.getOwnPropertyDescriptors) {
			Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
		} else {
			ownKeys(Object(source)).forEach(function(key) {
				Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
			});
		}
	} return target;
}


function _defineProperty(obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key,
			{ value: value, enumerable: true, configurable: true, writable: true });
	} else { obj[key] = value; } return obj;
}


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) {
		resolve(value);
	} else { Promise.resolve(value).then(_next, _throw); }
}

function _asyncToGenerator(fn) {
	return function() {
		var self = this, args = arguments; return new Promise(
			function(resolve, reject) {
				var gen = fn.apply(self, args);
				function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); }
				function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined);
			});
	};
}
const BASE_URL = window.location.origin;

const ENVIRONMENT = {
	prod: "prod",
	staging: "staging",
	dev: "dev"
};


const ERRORS = {
	PREVIEW: "Unable to load preview. Please try again later."
};


const getEnvironment = () => {
	// PROD, STAGING, DEV
	if (window.location.host === "ppubs.uspto.gov") {
		return ENVIRONMENT.prod;
	} else if (window.location.host === "staging.ppubs.aws.uspto.gov") {
		return ENVIRONMENT.staging;
	} else {
		return ENVIRONMENT.dev;
	}
};

const getProtectedServiceURL = () => {
	if (getEnvironment() === ENVIRONMENT.prod) {
		return "https://image-ppubs.uspto.gov";
	} else if (getEnvironment() === ENVIRONMENT.staging) {
		return "https://staging-image.ppubs.aws.uspto.gov";
	} else {
		return window.location.origin;
	}
};

const BASE_PROTECTED_SERVICE_URL = getProtectedServiceURL();

const SERVICES = {
	metadata: `${BASE_PROTECTED_SERVICE_URL}/dirsearch-public/patents/metadata`,
	downloadPDF: `${BASE_PROTECTED_SERVICE_URL}/dirsearch-public/print/downloadPdf`,
	generic: `${BASE_URL}/dirsearch-public/searches/generic`,
	image: `${BASE_URL}/dirsearch-public/image-conversion/convert`
};


class SearchResultsDoc {
	constructor(
		documentId,
		inventors,
		pageCount,
		patentNumber,
		publicationDate,
		title) {
		this.documentId = documentId;
		this.inventors = inventors;
		this.pageCount = pageCount;
		this.patentNumber = patentNumber;
		this.publicationDate = publicationDate;
		this.title = title;
	}

	getDocumentId() {
		return this.documentId;
	}

	getInventors() {
		return this.inventors;
	}

	getPageCount() {
		return this.pageCount;
	}

	getPatentNumber() {
		return this.patentNumber;
	}

	getPublicationDate() {
		return this.publicationDate;
	}

	getTitle() {
		return this.title;
	}

	toObject() {
		return {
			documentId: this.getDocumentId(),
			inventors: this.getInventors(),
			pageCount: this.getPageCount(),
			patentNumber: this.getPatentNumber(),
			publicationDate: this.getPublicationDate(),
			title: this.getTitle()
		};

	}

	static parse(responseDoc) {
		const {
			datePublished,
			documentId,
			inventors,
			pageCount,
			patentNumber,
			title } =
			responseDoc;

		return new SearchResultsDoc(
			documentId,
			inventors,
			pageCount,
			patentNumber,
			datePublished,
			title);

	}
}


class SearchResultsDTO {
	constructor(cursorMarker, docs, totalResults) {
		this.cursorMarker = cursorMarker;
		this.docs = this.parseDocuments(docs);
		this.totalResults = totalResults;
	}

	parseDocuments(docs) {
		if (docs === undefined || docs?.length === 0) {
			return [];
		}

		return docs.map(doc => SearchResultsDoc.parse(doc));
	}

	getDocuments() {
		return this.docs;
	}

	getCursorMarker() {
		return this.cursorMarker;
	}

	getTotalResults() {
		return this.totalResults;
	}

	getDocsObject() {
		return this.getDocuments().map(doc => doc.toObject());
	}

	static parse(response) {
		const { cursorMarker, docs, numFound } = response;

		return new SearchResultsDTO(cursorMarker, docs, numFound);
	}
}


class Search {
	constructor() {
		this.query = "";
		this.pageSize = 50;
		this.operator = "";
		this.cursorMarker = "*";
	}

	setCursorMarker(cursorMarker) {
		this.cursorMarker = cursorMarker;
	}

	getCursorMarker() {
		return this.cursorMarker;
	}

	resetCursorMarker() {
		this.setCursorMarker("*");
	}

	getPageSize() {
		return this.pageSize;
	}

	setQuery(query) {
		this.query = query;

		// when query is set, reset cursormarker
		this.resetCursorMarker();
	}

	getQuery() {
		return this.query;
	}

	setOperator(operator) {
		this.operator = operator;
	}

	getOperator() {
		return this.operator;
	}

	getPayload() {
		return JSON.stringify({
			cursorMarker: this.getCursorMarker(),
			databaseFilters: [
				{
					databaseName: "USPAT"
				},

				{
					databaseName: "US-PGPUB"
				},

				{
					databaseName: "USOCR"
				}],


			fields: [
				"documentId",
				"patentNumber",
				"title",
				"datePublished",
				"inventors",
				"pageCount"],

			op: this.getOperator(),
			pageSize: this.getPageSize(),
			q: this.getQuery(),
			searchType: 0,
			sort: "date_publ desc"
		});

	}
} function


	fetchWithTimeout(_x) { return _fetchWithTimeout.apply(this, arguments); } function _fetchWithTimeout() {
		_fetchWithTimeout = _asyncToGenerator(function*(resource, options = {}) {
			const { timeout = 60000 } = options;

			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), timeout);
			const response = yield fetch(resource, _objectSpread(_objectSpread({},
				options), {}, {
				signal: controller.signal
			}));

			clearTimeout(id);
			return response;
		}); return _fetchWithTimeout.apply(this, arguments);
	}

const searchDTO = new Search();
let searchResultsDTO = new SearchResultsDTO();

// JavaScript Document
jQuery(function() {
	//***********************************
	// Fetch header dynamic menu
	//***********************************
	ptoDynamicHeader.loadMenu();

	//simple sppiner
	function showSpinner() {
		$(".overlay").removeClass("d-none");
	}

	function hideSpinner() {
		$("div.overlay").addClass("d-none");
	}

	function hidetopMessage() {
		$(".topmsg").addClass("d-none");
	}

	/* show hide system message */
	function showtopMessage(className, heading, msg, small) {
		var strVar = "";
		var icon = "";

		// alert icon according to class
		if (className === "info") {
			icon = "info";
		} else if (className === "warning") {
			icon = "warning";
		} else if (className === "success") {
			icon = "check_circle";
		} else if (className === "danger") {
			icon = "error";
		}

		strVar +=
			'<div class="alert alert-' + className + " " + small + '" role="alert">';
		strVar += '<div class="alert-icon">';
		strVar += '<i class="material-icons">' + icon + "</i> ";
		strVar += "</div>";
		strVar += "<div>";
		if (heading !== "") {
			strVar += '<h4 class="alert-heading">' + heading + "</h4>";
		}
		strVar += msg + "</div>";
		strVar += "</div>";
		$(".topmsg").html(strVar);
		$(".topmsg").removeClass("d-none");

		setTimeout(() => {
			$(".topmsg").trigger("focus");
		}, 200);
	}

	//***********************************
	//General
	//***********************************
	function isUserInputValid(input) {
		const trimmedInput = input.trim();

		return !trimmedInput.includes(" ");
	}

	function showNoRecordsFound() {
		$(".searchResultsArea").removeClass("d-none");
		$(".topmsg, #resultInfo, #pagination").addClass("d-none");
	}

	function hideNoRecordsFound() {
		$(".searchResultsArea, #resultInfo, #pagination").removeClass("d-none");
	}

	function hideSearchResults() {
		$(".searchResultsArea").addClass("d-none");
	}

	function showSearchResults() {
		$(".searchResultsArea").addClass("d-none");
	}

	function initializeDataTable() {
		$("#searchResults").DataTable({
			columns: [
				{
					title: "Result #",
					data: null,
					orderable: false,
					render: (data, type, full, meta) => meta.row + 1
				},

				{
					title: "Document/Patent number",
					data: "documentId",
					orderable: false
				},

				{
					data: null,
					orderable: false,
					render: (data) =>
						`<button type="button" class="btn btn-link"
            data-html="true"
            data-toggle="tooltip"
            data-trigger="click"
            data-placement="right"
            data-patentnumber="${data.patentNumber}"
            title="<div>Loading...</div>">Preview</button> &nbsp; <a href="${SERVICES.downloadPDF}/${data.patentNumber}" target="_blank">PDF</a>`
				},

				{ title: "Title", data: "title", orderable: false },
				{ title: "Inventor name", data: "inventors", orderable: false },
				{
					title: "Publication date",
					data: "publicationDate",
					orderable: false
				},

				{ title: "Pages", data: "pageCount", orderable: false }],

			dom: `<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6 text-right'i>>
      <'row'<'col-sm-12'tr>>`,
			drawCallback: function() {
				/* Apply the tooltips */
				$("[data-toggle=tooltip]").tooltip({
					html: true
				});

			},
			info: false,
			lengthChange: false,
			language: {
				emptyTable: "No records found"
			},

			ordering: false,
			pageLength: searchDTO.getPageSize(),
			paging: true,
			searching: false
		});

	}

	initializeDataTable();

	function addData(data) {
		const datatable = $("#searchResults").dataTable().api();

		if (datatable) {
			datatable.rows.add(data);
		}
	}

	function renderData(searchResultsDTO) {
		if (searchResultsDTO.getTotalResults() === 0) {
			showNoRecordsFound();
		} else {
			hideNoRecordsFound();
		}

		addData(searchResultsDTO.getDocsObject());
	}

	function convertValueToQuery(value, { type }) {
		if (value.trim().length === 0) {
			return null;
		}

		if (type.toLowerCase() === "all") {
			return value.trim();
		}

		if (type.toLowerCase() === "pd") {
			return `@pd="${value.trim()}"`;
		}

		return `(${value.trim()}).${type.toLowerCase()}.`;
	}

	function updateQueryText(query) {
		$("#querySearched").text(`"${query}"`);
	}

	function updateTotalInfoText({ currentPage, totalResults }) {
		const startDocumentIndex = currentPage * searchDTO.getPageSize() + 1;
		const endDocumentIndex = Math.min(
			currentPage * searchDTO.getPageSize() + searchDTO.getPageSize(),
			totalResults);


		$("#resultInfo").text(
			`Showing ${startDocumentIndex} to ${endDocumentIndex} of ${totalResults} records`);

	}

	function updatePagination({ start, totalResults }) {
		const lastPage = Math.floor(totalResults / searchDTO.getPageSize());
		const currentPage = start / searchDTO.getPageSize();

		if (currentPage === 0) {
			$("#paginationPrevItem").addClass("disabled");
		} else {
			$("#paginationPrevItem").removeClass("disabled");
		}

		if (currentPage === lastPage) {
			$("#paginationNextItem").addClass("disabled");
		} else {
			$("#paginationNextItem").removeClass("disabled");
		}

		$("#pageInfo").text(`Page ${currentPage + 1} of ${lastPage + 1}`);

		updateTotalInfoText({ currentPage: currentPage, totalResults });
	}

	function performSearch() {
		showSpinner();

		return fetchWithTimeout(SERVICES.generic, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},

			body: searchDTO.getPayload()
		}).

			then(response => {
				return response.json();
			}).
			then(data => {
				hideSpinner();

				if (data.developerMessage) {
					hideSearchResults();

					showtopMessage(
						"danger",
						"Error status",
						"Search request failed due to the following reason: " +
						data.developerMessage,
						"");


					return;
				}

				hidetopMessage();
				showSearchResults();

				searchResultsDTO = SearchResultsDTO.parse(data);

				searchDTO.setCursorMarker(searchResultsDTO.getCursorMarker());

				updateQueryText(searchDTO.getQuery());

				renderData(searchResultsDTO);
			}).
			catch(() => {
				hideSpinner();
				hideSearchResults();

				showtopMessage(
					"danger",
					"Error status",
					"Search request failed due to network issue, please try again later.",
					"");

			});
	}

	function initialSearch() {
		const datatable = $("#searchResults").dataTable().api();
		$("[data-toggle=tooltip]").tooltip("hide");

		if (datatable) {
			datatable.clear();
			datatable.page("first");
		}

		performSearch().then(() => {
			updatePagination({
				start: 0,
				totalResults: searchResultsDTO.getTotalResults()
			});


			if (datatable) {
				datatable.draw(false);
			}
		});
	}

	$("body").on("click", e => {
		$("[data-toggle=tooltip]").not(e.target).tooltip("hide");
	});

	$("body").on("show.bs.tooltip", "[data-toggle=tooltip]", function() {
		$("[data-toggle=tooltip]").not(this).tooltip("hide");

		const patentNumber = $(this).data("patentnumber");

		if ($(this).data("tooltiploaded") === true) {
			return;
		}

		// fetch the metadata endpoint to retrieve image url
		fetchWithTimeout(`${SERVICES.metadata}/${patentNumber}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			}
		}).


			then(response => {
				// if response is ok, return the json to the next callback
				if (response.ok) {
					return response.json();
				}

				// otherwise, reject the response so it goes to the catch block to handle the error
				return Promise.reject(response);
			}).
			then(data => {
				// if tooltip is no longer being shown
				// don't bother updating the content
				if (!$(this).attr("aria-describedby")) {
					// send canceled to the next then block
					return 'CANCELED';
				}

				const imageURL = `${SERVICES.image}?url=${data.imageLocation}/${data.imageFileName}`;

				// fetch the image
				return fetchWithTimeout(imageURL).then(response => {
					// if response is ok, return the imageURL to the next callback
					if (response.ok) {
						return imageURL;
					}

					// otherwise, reject the response so it goes to the catch block to handle the error
					return Promise.reject(response);
				});
			}).
			then(imageURL => {
				// don't update the image if it has been canceled
				if (imageURL === "CANCELED") {
					return;
				}

				// only show the image if its successfully retrieved
				$(this).
					data("tooltiploaded", true).
					attr(
						"title",
						`<img src="${imageURL}" />`).

					tooltip("_fixTitle").
					tooltip("show");
			}).
			catch(() => {
				// handle all errors for the preview
				$(this).
					data("tooltiploaded", true).
					attr("title", ERRORS.PREVIEW).
					tooltip("_fixTitle").
					tooltip("show");
			});
	});

	$("body").on("click", ".showGuidance-btn", function(e) {
		e.preventDefault(e);
		$("#guidance-Modal").modal({
			backdrop: "static",
			keyboard: false,
			show: true
		});

	});

	$("#searchResults").on("page.dt", function() {
		const datatable = $("#searchResults").DataTable();

		const pageInfo = datatable.page.info();

		updatePagination({
			start: pageInfo.start,
			totalResults: searchResultsDTO.getTotalResults()
		});

	});

	$("body").on("click", "#paginationPrevItem a", e => {
		e.preventDefault();
		$("[data-toggle=tooltip]").tooltip("hide");

		const datatable = $("#searchResults").DataTable();

		datatable.page("previous").draw("page");
	});

	$("body").on("click", "#paginationNextItem a", e => {
		e.preventDefault();
		$("[data-toggle=tooltip]").tooltip("hide");

		const datatable = $("#searchResults").DataTable();

		const pageInfo = datatable.page.info();

		// if we already have the page, don't attempt to call the API
		if (
			pageInfo.page === pageInfo.pages - 1 &&
			searchResultsDTO.getTotalResults() > pageInfo.recordsTotal) {
			performSearch().then(() =>
				datatable.draw(false).page("next").draw("page"));

		} else {
			datatable.page("next").draw("page");
		}
	});

	$("body").on("click", "#basicSearchBtn", e => {
		e.preventDefault();

		const searchField1 = $("#searchField1").val();
		const searchText1 = $("#searchText1").val();
		const searchOperator = $("#searchOperator").val();
		const searchField2 = $("#searchField2").val();
		const searchText2 = $("#searchText2").val();

		hideSearchResults();

		if (!isUserInputValid(searchText1) || !isUserInputValid(searchText2)) {
			showtopMessage(
				"danger",
				"Error status",
				" Please enter only one word per text box",
				"");

			return;
		}

		const query1 = convertValueToQuery(searchText1, { type: searchField1 });
		const query2 = convertValueToQuery(searchText2, { type: searchField2 });

		if (query1 === null && query1 === null) {
			showtopMessage("danger", "Error status", " Please enter a query", "");
			return;
		} else {
			hidetopMessage();
		}

		let finalQuery;

		if (query1 && query2) {
			finalQuery = `${query1} ${searchOperator} ${query2}`;
		} else if (query1) {
			finalQuery = query1;
		} else if (query2) {
			finalQuery = query2;
		}

		searchDTO.setQuery(finalQuery);
		searchDTO.setOperator(searchOperator);

		initialSearch();
	});

	$("body").on("click", "#quickLookupSearchBtn", e => {
		e.preventDefault();

		hideSearchResults();

		const value = $("#quickLookupTextInput").val();

		if (!isUserInputValid(value)) {
			showtopMessage(
				"danger",
				"Error status",
				" Please enter only one word per text box",
				"");

			return;
		}

		const query = convertValueToQuery(value, { type: "pn" });

		if (query === null) {
			showtopMessage("danger", "Error status", " Please enter a query", "");
			return;
		} else {
			hidetopMessage();
		}

		searchDTO.setQuery(query);
		searchDTO.setOperator("OR");

		initialSearch();
	});
});
//# sourceMappingURL=custom-scripts.js.map
