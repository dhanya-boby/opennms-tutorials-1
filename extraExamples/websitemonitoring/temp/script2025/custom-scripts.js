import SearchResultsDTO from "./models/SearchResultsDTO.js";
import Search from "./models/Search.js";

const BASIC_SESSION_KEY = 'advanced_lastUsedSessionId';

const BASIC_ACCESS_TOKEN = 'x-access-token';

const BASE_URL = window.location.origin;
const INTERNAL_PATH = 'api';

const ERRORS = {
  PREVIEW: `Requested image is missing.  Please <a href="${BASE_URL}/pubwebapp/static/pages/contact-us.html" target="_blank">contact us</a> so this can be resolved.`
};


const SERVICES = {
  metadata: `${BASE_URL}/${INTERNAL_PATH}/patents/metadata`,
  downloadPDF: `${BASE_URL}/${INTERNAL_PATH}/pdf/downloadPdf`,
  viewText: `${BASE_URL}/${INTERNAL_PATH}/patents/html`,
  generic: `${BASE_URL}/${INTERNAL_PATH}/searches/generic`,
  image: `${BASE_URL}/${INTERNAL_PATH}/image/convert`,
  session: `${BASE_URL}/${INTERNAL_PATH}/users/me/session`
};


const searchDTO = new Search();
let searchResultsDTO = new SearchResultsDTO();

async function fetchWithTimeout(resource, options = {}) {
  //DE71311 added missing token info in the headers
  const { timeout = 60000, headers = {'Content-Type': 'application/json; charset=utf-8', 'x-access-token': localStorage.getItem(BASIC_ACCESS_TOKEN)} } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    headers: headers,
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}

// set session
function getAuthSession() {
  let sessionId = localStorage.getItem(BASIC_SESSION_KEY);
  if (!sessionId) {
    sessionId = -1;
  }

  return fetchWithTimeout(SERVICES.session, {
    method: "POST",
    body: sessionId,
  }).then((response) => {
    localStorage.setItem(BASIC_ACCESS_TOKEN, response.headers.get(BASIC_ACCESS_TOKEN));
  });
};

getAuthSession();

// JavaScript Document
jQuery(function () {
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
      '<div class="alert alert-' + className + " " + small + '" role="alert" tabindex="-1">';
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
      $(".topmsg .alert-danger").trigger("focus");
    }, 200);
  }

  function fetchWithAuthToken(resource, options, count = 1) {
    const { headers = {} } = options;
    const accessToken = localStorage.getItem(BASIC_ACCESS_TOKEN);

    if (accessToken) {
      headers['x-access-token'] = accessToken;
    }

    return new Promise(async function(resolve, reject) {
      const response = await fetchWithTimeout(resource, { ...options, headers: { ...headers}});

      if (!response.ok) {
        // after 3 tries, stop authenticating
        if (response.status === 401) {
          if (count < 3) {
            getAuthSession().then(() => {
              fetchWithAuthToken(resource, options, count + 1).then(resolve, reject);
            }).catch(() => {
              reject(response);
            });
          } else {
            reject(response);
          }
        } else if (response.status === 429) {
          showtopMessage("danger", "Error status", " There are too many requests in your user session. Please try your request again later.", "");
          reject(response);
        }
      } else {
        resolve(response);
      }
    });
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
          render: (data, type, full, meta) => meta.row + 1,
        },
        {
          title: "Document/Patent number",
          data: "documentId",
          orderable: false,
        },
        {
          title: "Display",
          data: null,
          orderable: false,
          render: (data) => {
            const disabledAttribute = (data.pageCount === 0) ? 'disabled="disabled"' : '';
            const disabledClass = (data.pageCount === 0) ? 'disabled' : '';

            return `<button type="button" class="btn btn-link"
                    data-html="true"
                    data-toggle="tooltip"
                    data-trigger="click"
                    data-placement="right"
                    data-patentnumber="${data.patentNumber}"
                    ${disabledAttribute}
                    aria-label="Preview for ${data.documentId}"
                    title="<div>Loading...</div>">Preview</button> 
                    &nbsp; <a class="btn-link ${disabledClass}" href="${SERVICES.downloadPDF}/${data.patentNumber}?requestToken=${localStorage.getItem(BASIC_ACCESS_TOKEN)}" target="_blank" aria-label="Open PDF link for ${data.documentId} in a new tab">PDF</a>
                    &nbsp; <a class="btn-link" href="${SERVICES.viewText}/${data.patentNumber}?source=${data.type}&requestToken=${localStorage.getItem(BASIC_ACCESS_TOKEN)}" target="_blank" aria-label="Open text link for ${data.documentId} in a new tab">Text</a>`;
          }
        },
        { title: "Title", data: "title", orderable: false },
        { title: "Inventor name", data: "inventors", orderable: false },
        {
          title: "Publication date",
          data: "publicationDate",
          orderable: false,
        },
        { title: "Pages", data: "pageCount", orderable: false },
      ],
      dom: `<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6 text-right'i>>
      <'row'<'col-sm-12'tr>>`,
      drawCallback: function () {
        /* Apply the tooltips */
        $("[data-toggle=tooltip]").tooltip({
          html: true,
        });
      },
      info: false,
      lengthChange: false,
      language: {
        emptyTable: "No records found",
      },
      ordering: false,
      pageLength: searchDTO.getPageSize(),
      paging: true,
      searching: false,
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
      totalResults
    );

    $("#resultInfo").text(
      `Showing ${startDocumentIndex} to ${endDocumentIndex} of ${totalResults} records`
    );
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

    return fetchWithAuthToken(SERVICES.generic, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: searchDTO.getPayload(),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        hideSpinner();

        if (!data) {
          return;
        }

        if (data.developerMessage) {
          hideSearchResults();

          showtopMessage(
            "danger",
            "Error status",
            "Search request failed due to the following reason: " +
              data.developerMessage,
            ""
          );

          return;
        }

        hidetopMessage();
        showSearchResults();

        searchResultsDTO = SearchResultsDTO.parse(data);

        searchDTO.setCursorMarker(searchResultsDTO.getCursorMarker());

        updateQueryText(searchDTO.getQuery());

        renderData(searchResultsDTO);
      })
      .catch((error) => {
        console.log(error);
        hideSpinner();
        hideSearchResults();

        if (error.status !== 429) {
          showtopMessage(
            "danger",
            "Error status",
            "Search request failed due to network issue, please try again later.",
            ""
          );
        }
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
        totalResults: searchResultsDTO.getTotalResults(),
      });

      if (datatable) {
        datatable.draw(false);
      }
    });
  }

  $("body").on("click", (e) => {
    $("[data-toggle=tooltip]").not(e.target).tooltip("hide");
  });

  $("body").on("show.bs.tooltip", "[data-toggle=tooltip]", function () {
    $("[data-toggle=tooltip]").not(this).tooltip("hide");

    const patentNumber = $(this).data("patentnumber");

    if ($(this).data("tooltiploaded") === true) {
      return;
    }

    // fetch the metadata endpoint to retrieve image url
    fetchWithAuthToken(`${SERVICES.metadata}/${patentNumber}?requestToken=${localStorage.getItem(BASIC_ACCESS_TOKEN)}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        // if response is ok, return the json to the next callback
        if (response.ok) {
          return response.json();
        }

        // otherwise, reject the response so it goes to the catch block to handle the error
        return Promise.reject(response);
      })
      .then((data) => {
        // if tooltip is no longer being shown
        // don't bother updating the content
        if (!$(this).attr("aria-describedby")) {
            // send canceled to the next then block
            return 'CANCELED';
        }

        const imageURL = `${SERVICES.image}?url=${data.imageLocation}/${data.imageFileName}&requestToken=${localStorage.getItem(BASIC_ACCESS_TOKEN)}`;

        // fetch the image using regular fetch since token is part of the URI
        return window.fetch(imageURL).then((response) => {
            // if response is ok, return the imageURL to the next callback
            if (response.ok) {
                return imageURL;
            }
    
            // otherwise, reject the response so it goes to the catch block to handle the error
            return Promise.reject(response);
        });
      })
      .then((imageURL) => {
        // don't update the image if it has been canceled
        if (imageURL === "CANCELED") {
            return;
        }

        // only show the image if its successfully retrieved
        $(this)
          .data("tooltiploaded", true)
          .attr(
            "title",
            `<img src="${imageURL}" />`
          )
          .tooltip("_fixTitle")
          .tooltip("show");
      })
      .catch((error) => {
        console.log(error);
        // handle all errors for the preview
        $(this)
          .data("tooltiploaded", true)
          .attr("title", ERRORS.PREVIEW)
          .tooltip("_fixTitle")
          .tooltip("show");
      });
  });

  $("body").on("click", ".showGuidance-btn", function (e) {
    e.preventDefault(e);
    $("#guidance-Modal").modal({
      backdrop: "static",
      keyboard: false,
      show: true,
    });
  });

  $("#searchResults").on("page.dt", function () {
    const datatable = $("#searchResults").DataTable();

    const pageInfo = datatable.page.info();

    updatePagination({
      start: pageInfo.start,
      totalResults: searchResultsDTO.getTotalResults(),
    });
  });

  $("body").on("click", "#paginationPrevItem a", (e) => {
    e.preventDefault();
    $("[data-toggle=tooltip]").tooltip("hide");

    const datatable = $("#searchResults").DataTable();

    datatable.page("previous").draw("page");
  });

  $("body").on("click", "#paginationNextItem a", (e) => {
    e.preventDefault();
    $("[data-toggle=tooltip]").tooltip("hide");

    const datatable = $("#searchResults").DataTable();

    const pageInfo = datatable.page.info();

    // if we already have the page, don't attempt to call the API
    if (
      pageInfo.page === pageInfo.pages - 1 &&
      searchResultsDTO.getTotalResults() > pageInfo.recordsTotal
    ) {
      performSearch().then(() =>
        datatable.draw(false).page("next").draw("page")
      );
    } else {
      datatable.page("next").draw("page");
    }
  });

  $("body").on("click", "#basicSearchBtn", (e) => {
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
        ""
      );
      return;
    }

    const query1 = convertValueToQuery(searchText1, { type: searchField1 });
    const query2 = convertValueToQuery(searchText2, { type: searchField2 });

    if (query1 === null && query2 === null) {
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

  $("body").on("click", "#quickLookupSearchBtn", (e) => {
    e.preventDefault();

    hideSearchResults();

    const value = $("#quickLookupTextInput").val();

    if (!isUserInputValid(value)) {
      showtopMessage(
        "danger",
        "Error status",
        " Please enter only one word per text box",
        ""
      );
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
