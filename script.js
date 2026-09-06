/* =========================================================
   BHOOMI DRISHTI
   Prototype Authentication + Dashboard Logic
   (Now connected to PHP + MySQL backend)
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentRole = null;

let currentUser = null;


/*
    Government ID format check.

    IMPORTANT:
    This is only prototype verification.
    Any ID matching the pattern GOV-2026-XXX (3 digits)
    is accepted, e.g. GOV-2026-001, GOV-2026-047, GOV-2026-999.
    A real implementation would verify this against
    an official government authentication/database service.
*/

const governmentIdPattern = /^GOV-2026-\d{3}$/;


/* =========================================================
   ROLE SELECTION
========================================================= */

function openLogin(role) {

    currentRole = role;

    document.getElementById("roleSelection")
        .classList.add("hidden");

    document.getElementById("registrationSection")
        .classList.add("hidden");

    document.getElementById("loginSection")
        .classList.remove("hidden");


    const title = document.getElementById("loginTitle");

    const subtitle = document.getElementById("loginSubtitle");

    if (role === "government") {

        title.textContent =
            "Government Official Login";

        subtitle.textContent =
            "Access the Government Management Portal";

    }

    else {

        title.textContent =
            "Land Owner Login";

        subtitle.textContent =
            "Access your Land Owner Portal";

    }


    document.getElementById("loginIdentifier").value = "";

    document.getElementById("loginPassword").value = "";

    clearMessages();

}


/* =========================================================
   BACK TO ROLE SELECTION
========================================================= */

function backToRoles() {

    document.getElementById("loginSection")
        .classList.add("hidden");

    document.getElementById("registrationSection")
        .classList.add("hidden");

    document.getElementById("roleSelection")
        .classList.remove("hidden");

    clearMessages();

}


/* =========================================================
   REGISTRATION
========================================================= */

function openRegistration() {

    if (!currentRole) {
        return;
    }

    document.getElementById("roleSelection")
        .classList.add("hidden");

    document.getElementById("loginSection")
        .classList.add("hidden");

    document.getElementById("registrationSection")
        .classList.remove("hidden");


    const govForm =
        document.getElementById("governmentRegistration");

    const ownerForm =
        document.getElementById("landownerRegistration");


    if (currentRole === "government") {

        govForm.classList.remove("hidden");

        ownerForm.classList.add("hidden");

        document.getElementById("registerTitle")
            .textContent = "Government Official Registration";

        document.getElementById("registerSubtitle")
            .textContent =
            "Verify your official identity and create an account.";

    }

    else {

        ownerForm.classList.remove("hidden");

        govForm.classList.add("hidden");

        document.getElementById("registerTitle")
            .textContent = "Land Owner Registration";

        document.getElementById("registerSubtitle")
            .textContent =
            "Create your secure land owner account.";

    }

    clearMessages();

}


/* =========================================================
   GOVERNMENT REGISTRATION
========================================================= */

document
    .getElementById("governmentRegistration")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const department =
            document.getElementById("govDepartment").value;

        const position =
            document.getElementById("govPosition").value;

        const uniqueId =
            document.getElementById("govUniqueId").value
                .trim()
                .toUpperCase();

        const name =
            document.getElementById("govName").value.trim();

        const governmentId =
            document.getElementById("govId").value.trim();

        const email =
            document.getElementById("govEmail").value
                .trim()
                .toLowerCase();

        const phone =
            document.getElementById("govPhone").value.trim();

        const password =
            document.getElementById("govPassword").value;


        /*
            STEP 1:
            Validate government official ID.
        */

        if (!governmentIdPattern.test(uniqueId)) {

            showRegisterMessage(
                "Government Official ID could not be verified. Format required: GOV-2026-XXX (e.g. GOV-2026-042).",
                "error"
            );

            return;

        }


        /*
            STEP 2:
            Validate phone.
        */

        if (!/^[6-9]\d{9}$/.test(phone)) {

            showRegisterMessage(
                "Please enter a valid 10-digit Indian mobile number.",
                "error"
            );

            return;

        }


        /*
            STEP 3:
            Password validation.
        */

        if (password.length < 6) {

            showRegisterMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        /*
            STEP 4:
            Send to PHP backend (register.php) instead of localStorage.
        */

        fetch("api/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: "government",
                department: department,
                position: position,
                uniqueId: uniqueId,
                governmentId: governmentId,
                name: name,
                email: email,
                phone: phone,
                password: password
            })
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {

            if (!data.success) {

                showRegisterMessage(
                    data.message,
                    "error"
                );

                return;

            }

            showRegisterMessage(
                "Government account created successfully. Redirecting to login...",
                "success"
            );

            setTimeout(function() {

                openLogin("government");

            }, 1200);

        })
        .catch(function() {

            showRegisterMessage(
                "Server error. Please make sure XAMPP (Apache + MySQL) is running.",
                "error"
            );

        });

    });


/* =========================================================
   LAND OWNER REGISTRATION
========================================================= */

document
    .getElementById("landownerRegistration")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const governmentId =
            document.getElementById("ownerGovId").value.trim();

        const name =
            document.getElementById("ownerName").value.trim();

        const phone =
            document.getElementById("ownerPhone").value.trim();

        const email =
            document.getElementById("ownerEmail").value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("ownerPassword").value;


        /*
            Validate phone.
        */

        if (!/^[6-9]\d{9}$/.test(phone)) {

            showRegisterMessage(
                "Please enter a valid 10-digit Indian mobile number.",
                "error"
            );

            return;

        }


        /*
            Validate password.
        */

        if (password.length < 6) {

            showRegisterMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        /*
            Send to PHP backend (register.php) instead of localStorage.
        */

        fetch("api/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: "landowner",
                governmentId: governmentId,
                name: name,
                phone: phone,
                email: email,
                password: password
            })
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {

            if (!data.success) {

                showRegisterMessage(
                    data.message,
                    "error"
                );

                return;

            }

            showRegisterMessage(
                "Land owner account created successfully. Redirecting to login...",
                "success"
            );

            setTimeout(function() {

                openLogin("landowner");

            }, 1200);

        })
        .catch(function() {

            showRegisterMessage(
                "Server error. Please make sure XAMPP (Apache + MySQL) is running.",
                "error"
            );

        });

    });


/* =========================================================
   LOGIN
========================================================= */

document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const identifier =
            document.getElementById("loginIdentifier")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("loginPassword").value;


        /*
            Demo fallback login (kept exactly like before,
            checked first so demo accounts always work
            even with an empty database).
        */

        let demoUser = null;

        if (
            currentRole === "government" &&
            identifier === "admin@bhoomidrishti.gov" &&
            password === "admin123"
        ) {

            demoUser = {

                role: "government",

                department:
                    "District Administration",

                position:
                    "District Officer",

                uniqueId:
                    "GOV-2026-001",

                governmentId:
                    "GOV-ID-DEMO",

                name:
                    "Demo Government Official",

                email:
                    "admin@bhoomidrishti.gov",

                phone:
                    "9876543210"

            };

        }

        else if (
            currentRole === "landowner" &&
            identifier === "owner@demo.com" &&
            password === "owner123"
        ) {

            demoUser = {

                role: "landowner",

                governmentId:
                    "OWNER-ID-001",

                name:
                    "Demo Land Owner",

                email:
                    "owner@demo.com",

                phone:
                    "9876543210"

            };

        }


        if (demoUser) {

            finishLogin(demoUser);

            return;

        }


        /*
            Real login via PHP backend (login.php) instead of localStorage.
        */

        fetch("api/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: currentRole,
                identifier: identifier,
                password: password
            })
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {

            if (!data.success) {

                showLoginMessage(
                    data.message,
                    "error"
                );

                return;

            }

            finishLogin(data.user);

        })
        .catch(function() {

            showLoginMessage(
                "Server error. Please make sure XAMPP (Apache + MySQL) is running.",
                "error"
            );

        });

    });


/*
    Shared final login step, used by both the demo fallback
    and the real PHP-backed login.
*/

function finishLogin(user) {

    currentUser = user;


    localStorage.setItem(
        "bhoomiCurrentUser",
        JSON.stringify(user)
    );


    showLoginMessage(
        "Login successful. Opening your portal...",
        "success"
    );


    setTimeout(function() {

        if (user.role === "government") {

            openGovernmentApp();

        }

        else {

            openLandOwnerApp();

        }

    }, 500);

}


/* =========================================================
   GOVERNMENT APPLICATION
========================================================= */

function openGovernmentApp() {

    document.getElementById("authPage")
        .classList.add("hidden");

    document.getElementById("landownerApp")
        .classList.add("hidden");

    document.getElementById("governmentApp")
        .classList.remove("hidden");


    const name =
        currentUser.name || "Government Official";

    const department =
        currentUser.department || "Government";


    document.getElementById("govUserName")
        .textContent = name;

    document.getElementById("govUserDepartment")
        .textContent = department;

    document.getElementById("topGovName")
        .textContent = name;

    document.getElementById("welcomeGovName")
        .textContent = name;

    loadNotifications("government");

}


/* =========================================================
   LAND OWNER APPLICATION
========================================================= */

function openLandOwnerApp() {

    document.getElementById("authPage")
        .classList.add("hidden");

    document.getElementById("governmentApp")
        .classList.add("hidden");

    document.getElementById("landownerApp")
        .classList.remove("hidden");


    const name =
        currentUser.name || "Land Owner";


    document.getElementById("ownerUserName")
        .textContent = name;

    document.getElementById("topOwnerName")
        .textContent = name;

    document.getElementById("welcomeOwnerName")
        .textContent = name;

    document.getElementById("profileOwnerName")
        .textContent = name;

    document.getElementById("profileOwnerGovId")
        .textContent =
        currentUser.governmentId || "-";

    document.getElementById("profileOwnerEmail")
        .textContent =
        currentUser.email || "-";

    document.getElementById("profileOwnerPhone")
        .textContent =
        currentUser.phone || "-";

    loadNotifications("landowner");

}


/* =========================================================
   GOVERNMENT NAVIGATION
========================================================= */

document.querySelectorAll(".nav-item")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            const page =
                button.dataset.page;

            showPage(page);

        });

    });


function showPage(pageId) {

    document.querySelectorAll(
        "#govPageContent .page-section"
    ).forEach(section => {

        section.classList.remove("active-page");

    });


    const selected =
        document.getElementById(pageId);


    if (selected) {

        selected.classList.add("active-page");

    }


    document.querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.dataset.page === pageId
            ) {

                button.classList.add("active");

            }

        });


    const titles = {

        govDashboard:
            ["Government Dashboard",
             "National land acquisition overview"],

        landMap:
            ["National Land Map",
             "Explore and monitor registered land parcels"],

        projects:
            ["Infrastructure Projects",
             "Monitor ongoing land acquisition projects"],

        acquisition:
            ["Land Acquisition",
             "Track acquisition cases and approvals"],

        owners:
            ["Land Owners",
             "Registered land owners and verification status"],

        conflicts:
            ["Land Conflicts",
             "AI-assisted conflict identification"],

        reports:
            ["Reports & Analytics",
             "National land acquisition statistics"],

        aiInsights:
            ["AI Decision Support",
             "AI-assisted land acquisition recommendations"],

        settings:
            ["Settings",
             "Portal and account settings"]

    };


    if (titles[pageId]) {

        document.getElementById("pageTitle")
            .textContent = titles[pageId][0];

        document.getElementById("pageSubtitle")
            .textContent = titles[pageId][1];

    }

}


/* =========================================================
   LAND OWNER NAVIGATION
========================================================= */

document.querySelectorAll(".owner-nav-item")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            const page =
                button.dataset.ownerPage;

            showOwnerPage(page);

        });

    });


function showOwnerPage(pageId) {

    document.querySelectorAll(
        "#ownerPageContent .page-section"
    ).forEach(section => {

        section.classList.remove("active-page");

    });


    const selected =
        document.getElementById(pageId);


    if (selected) {

        selected.classList.add("active-page");

    }


    document.querySelectorAll(
        ".owner-nav-item"
    ).forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.ownerPage === pageId
        ) {

            button.classList.add("active");

        }

    });


    const titles = {

        ownerHome:
            "My Land Portal",

        myLand:
            "My Land",

        myApplications:
            "My Applications",

        acquisitionStatus:
            "Acquisition Status",

        compensation:
            "Compensation",

        documents:
            "Documents",

        notifications:
            "Notifications",

        support:
            "Help & Support",

        ownerProfile:
            "My Profile"

    };


    if (titles[pageId]) {

        document.getElementById("ownerPageTitle")
            .textContent = titles[pageId];

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser = null;

    localStorage.removeItem(
        "bhoomiCurrentUser"
    );


    document.getElementById("governmentApp")
        .classList.add("hidden");

    document.getElementById("landownerApp")
        .classList.add("hidden");

    document.getElementById("authPage")
        .classList.remove("hidden");


    backToRoles();

    notifyUser("You have been logged out.");

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function togglePassword(inputId) {

    const input =
        document.getElementById(inputId);


    if (input.type === "password") {

        input.type = "text";

    }

    else {

        input.type = "password";

    }

}


/* =========================================================
   MESSAGES
========================================================= */


function showLoginMessage(message, type) {

    const element =
        document.getElementById("loginMessage");

    element.textContent = message;

    element.className =
        "message " + type;

}


function showRegisterMessage(message, type) {

    const element =
        document.getElementById("registerMessage");

    element.textContent = message;

    element.className =
        "message " + type;

}


function clearMessages() {

    const login =
        document.getElementById("loginMessage");

    const register =
        document.getElementById("registerMessage");


    login.textContent = "";

    login.className = "message";


    register.textContent = "";

    register.className = "message";

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

const notificationIcons = {
    registration: { icon: "fa-user-plus", color: "green" },
    conflict: { icon: "fa-triangle-exclamation", color: "red" },
    acquisition: { icon: "fa-file-signature", color: "orange" },
    compensation: { icon: "fa-indian-rupee-sign", color: "blue" },
    general: { icon: "fa-bell", color: "gray" }
};


function loadNotifications(role) {

    fetch("api/get_notifications.php?role=" + role)
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {

            if (!data.success) {
                return;
            }

            renderNotificationBadge(role, data.unread_count);
            renderNotificationDropdown(role, data.notifications);

        })
        .catch(function() {
            // Silently fail if the server isn't reachable
            // (e.g. viewing on GitHub Pages without PHP).
        });

}


function renderNotificationBadge(role, count) {

    const selector =
        role === "government"
            ? "#governmentApp .notification-btn span"
            : "#landownerApp .notification-btn span";

    const badge = document.querySelector(selector);

    if (!badge) {
        return;
    }

    if (count > 0) {
        badge.textContent = count;
        badge.style.display = "";
    } else {
        badge.style.display = "none";
    }

}


function renderNotificationDropdown(role, notifications) {

    const dropdownId =
        role === "government"
            ? "govNotificationDropdown"
            : "ownerNotificationDropdown";

    let dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
        return;
    }

    if (notifications.length === 0) {

        dropdown.innerHTML =
            "<div class='notif-empty'>No notifications yet.</div>";

        return;

    }

    let html = "";

    notifications.forEach(function(notif) {

        const meta =
            notificationIcons[notif.type] || notificationIcons.general;

        const unreadClass =
            notif.is_read == 0 ? "notif-unread" : "";

        html +=
            "<div class='notif-item " + unreadClass + "'>" +
                "<i class='fa-solid " + meta.icon +
                    " notif-icon " + meta.color + "'></i>" +
                "<div>" +
                    "<strong>" + notif.title + "</strong>" +
                    "<p>" + (notif.message || "") + "</p>" +
                    "<small>" + timeAgo(notif.created_at) + "</small>" +
                "</div>" +
            "</div>";

    });

    dropdown.innerHTML = html;

}


function timeAgo(dateString) {

    const then = new Date(dateString.replace(" ", "T"));
    const now = new Date();

    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return hours + (hours === 1 ? " hour ago" : " hours ago");
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
        return "Yesterday";
    }

    return days + " days ago";

}


function toggleNotificationDropdown(role) {

    const dropdownId =
        role === "government"
            ? "govNotificationDropdown"
            : "ownerNotificationDropdown";

    const dropdown =
        document.getElementById(dropdownId);

    if (!dropdown) {
        return;
    }

    const isOpening =
        dropdown.classList.contains("hidden");

    dropdown.classList.toggle("hidden");

    if (isOpening) {

        fetch("api/mark_notifications_read.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: role })
        })
        .then(function() {
            renderNotificationBadge(role, 0);
        })
        .catch(function() {});

    }

}


/* =========================================================
   TOAST
========================================================= */

function notifyUser(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    toastMessage.textContent = message;

    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================================
   MAP SEARCH
========================================================= */

let bhoomiMap = null;
let routePolyline = null;
let routeMarkers = [];

function initMap() {

    const india = {
        lat: 22.5726,
        lng: 88.3639
    };

    bhoomiMap = new google.maps.Map(
        document.getElementById("map"),
        {
            zoom: 6,
            center: india,
            mapTypeId: "roadmap"
        }
    );

    new google.maps.Marker({
        position: india,
        map: bhoomiMap,
        title: "Bhoomi Drishti"
    });
}
/* =========================================================
   MAP MODE TABS (Search Nearby vs Plan a Route)
========================================================= */

function switchMapMode(mode) {

    const nearbyForm = document.getElementById("nearbySearchForm");
    const routeForm = document.getElementById("routePlanForm");

    const nearbyTab = document.getElementById("tabSearchNearby");
    const routeTab = document.getElementById("tabPlanRoute");

    if (mode === "nearby") {

        nearbyForm.classList.remove("hidden");
        routeForm.classList.add("hidden");

        nearbyTab.classList.add("active");
        routeTab.classList.remove("active");

    } else {

        nearbyForm.classList.add("hidden");
        routeForm.classList.remove("hidden");

        nearbyTab.classList.remove("active");
        routeTab.classList.add("active");

    }

    clearRouteFromMap();

    document.getElementById("plotResults").innerHTML = "";

}


function clearRouteFromMap() {

    if (routePolyline) {
        routePolyline.setMap(null);
        routePolyline = null;
    }

    routeMarkers.forEach(function(marker) {
        marker.setMap(null);
    });

    routeMarkers = [];

}


let activeInfoWindow = null;


function addPlotMarker(plot) {

    const statusColors = {
        available: "#287A57",
        under_acquisition: "#D88928",
        acquired: "#687386",
        disputed: "#C83F49"
    };

    const color = statusColors[plot.status] || "#1E5AA8";

    const statusLabel = {
        available: "Available",
        under_acquisition: "Under Acquisition",
        acquired: "Acquired",
        disputed: "Disputed"
    }[plot.status] || plot.status;

    const marker = new google.maps.Marker({

        position: {
            lat: parseFloat(plot.latitude),
            lng: parseFloat(plot.longitude)
        },

        map: bhoomiMap,

        title: plot.name,

        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 9
        }

    });

    const infoContent =
        "<div style='font-family:Arial;padding:4px;min-width:160px;'>" +
            "<strong style='font-size:13px;'>" + plot.name + "</strong><br>" +
            "<span style='font-size:11px;color:#666;'>" +
                plot.district + ", " + plot.state +
            "</span><br>" +
            "<span style='font-size:11px;'>" +
                plot.area_acres + " Acres" +
            "</span><br>" +
            "<span style='font-size:11px;font-weight:bold;color:" + color + ";'>" +
                statusLabel +
            "</span>" +
        "</div>";

    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });

    marker.addListener("click", function() {

        if (activeInfoWindow) {
            activeInfoWindow.close();
        }

        infoWindow.open(bhoomiMap, marker);

        activeInfoWindow = infoWindow;

    });

    routeMarkers.push(marker);

    return marker;

}


/* =========================================================
   GEOCODE HELPER (shared by nearby search and route planning)
========================================================= */

function geocodeLocation(query) {

    return fetch(
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
        encodeURIComponent(query)
    )
    .then(function(res) {
        return res.json();
    })
    .then(function(results) {

        if (!results || results.length === 0) {
            return null;
        }

        return {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon)
        };

    });

}


/* =========================================================
   DISTANCE HELPERS
========================================================= */

function haversineKm(lat1, lng1, lat2, lng2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

}


function distanceToRouteKm(plotLat, plotLng, routeCoords) {

    let minDistance = Infinity;

    // Check distance to every point along the route.
    // The route has many points close together, so checking
    // vertices gives a good approximation of the true
    // closest-point-on-line distance for this use case.

    for (let i = 0; i < routeCoords.length; i++) {

        const d = haversineKm(
            plotLat, plotLng,
            routeCoords[i][1], routeCoords[i][0]
        );

        if (d < minDistance) {
            minDistance = d;
        }

    }

    return minDistance;

}


/* =========================================================
   PLAN A ROUTE
========================================================= */

function planRoute() {

    const fromValue =
        document.getElementById("routeFrom").value.trim();

    const toValue =
        document.getElementById("routeTo").value.trim();

    const corridor =
        document.getElementById("routeCorridor").value;

    if (!fromValue || !toValue) {

        notifyUser("Enter both a starting point and a destination.");

        return;

    }

    const resultsBox = document.getElementById("plotResults");

    resultsBox.innerHTML =
        "<p class='plot-loading'>Planning route...</p>";

    clearRouteFromMap();


    Promise.all([
        geocodeLocation(fromValue),
        geocodeLocation(toValue)
    ])
    .then(function(points) {

        const fromPoint = points[0];
        const toPoint = points[1];

        if (!fromPoint || !toPoint) {

            resultsBox.innerHTML =
                "<p class='plot-empty'>One of the locations could not be found. Try again.</p>";

            return;

        }


        // Get the actual road route using OSRM's free routing
        // service (no API key or billing required).

        const osrmUrl =
            "https://router.project-osrm.org/route/v1/driving/" +
            fromPoint.lng + "," + fromPoint.lat + ";" +
            toPoint.lng + "," + toPoint.lat +
            "?overview=full&geometries=geojson";

        fetch(osrmUrl)
        .then(function(res) {
            return res.json();
        })
        .then(function(routeData) {

            if (!routeData.routes || routeData.routes.length === 0) {

                resultsBox.innerHTML =
                    "<p class='plot-empty'>Could not find a route between these locations.</p>";

                return;

            }

            const routeCoords =
                routeData.routes[0].geometry.coordinates;

            const routeDistanceKm =
                (routeData.routes[0].distance / 1000).toFixed(1);


            // Now fetch all plots and check which fall within
            // the chosen corridor width of this route.

            fetch("api/get_all_plots.php")
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {

                if (!data.success) {

                    resultsBox.innerHTML =
                        "<p class='plot-empty'>Something went wrong loading plots.</p>";

                    return;

                }

                const matchedPlots = [];

                data.plots.forEach(function(plot) {

                    const distance = distanceToRouteKm(
                        parseFloat(plot.latitude),
                        parseFloat(plot.longitude),
                        routeCoords
                    );

                    if (distance <= corridor) {

                        plot.distance_km = Math.round(distance * 100) / 100;

                        matchedPlots.push(plot);

                    }

                });

                matchedPlots.sort(function(a, b) {
                    return a.distance_km - b.distance_km;
                });

                drawRouteOnMap(routeCoords, matchedPlots);

                renderRouteResults(
                    matchedPlots, fromValue, toValue,
                    routeDistanceKm, corridor
                );

            });

        })
        .catch(function() {

            resultsBox.innerHTML =
                "<p class='plot-empty'>Could not calculate the route. Please try again.</p>";

        });

    });

}


function drawRouteOnMap(routeCoords, matchedPlots) {

    if (!bhoomiMap) {
        return;
    }

    const path = routeCoords.map(function(coord) {
        return { lat: coord[1], lng: coord[0] };
    });

    routePolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#1E5AA8",
        strokeOpacity: 0.9,
        strokeWeight: 4
    });

    routePolyline.setMap(bhoomiMap);

    matchedPlots.forEach(function(plot) {

        addPlotMarker(plot);

    });

    const bounds = new google.maps.LatLngBounds();

    path.forEach(function(point) {
        bounds.extend(point);
    });

    bhoomiMap.fitBounds(bounds);

}


function renderRouteResults(plots, fromValue, toValue, routeDistanceKm, corridor) {

    const resultsBox = document.getElementById("plotResults");

    let html =
        "<h3 class='plot-results-title'>Route: " + fromValue +
        " to " + toValue + " (" + routeDistanceKm + " km) &mdash; " +
        plots.length + " plot(s) within " + corridor + " km corridor</h3>";

    if (plots.length === 0) {

        html +=
            "<p class='plot-empty'>No registered plots fall within this corridor.</p>";

        resultsBox.innerHTML = html;

        return;

    }

    plots.forEach(function(plot) {

        const statusLabel = {
            available: "Available",
            under_acquisition: "Under Acquisition",
            acquired: "Acquired",
            disputed: "Disputed"
        }[plot.status] || plot.status;

        const statusClass = {
            available: "success",
            under_acquisition: "warning-status",
            acquired: "",
            disputed: "danger"
        }[plot.status] || "";

        html +=
            "<div class='plot-result-card'>" +
                "<div>" +
                    "<strong>" + plot.name + "</strong>" +
                    "<span>" + plot.district + ", " + plot.state + "</span>" +
                "</div>" +
                "<div class='plot-result-meta'>" +
                    "<span>" + plot.area_acres + " Acres</span>" +
                    "<span>" + plot.distance_km + " km from route</span>" +
                "</div>" +
                "<span class='status " + statusClass + "'>" +
                    statusLabel +
                "</span>" +
            "</div>";

    });

    resultsBox.innerHTML = html;

}


function searchMap() {

    const value =
        document.getElementById("mapSearch")
            .value
            .trim();

    const radius =
        document.getElementById("mapRadius").value;


    if (!value) {

        notifyUser(
            "Enter a location to search."
        );

        return;

    }


    const resultsBox =
        document.getElementById("plotResults");

    resultsBox.innerHTML =
        "<p class='plot-loading'>Searching...</p>";


    // Step 1: Convert the typed location into coordinates
    // using OpenStreetMap's free Nominatim geocoding service
    // (no API key or billing required).

    fetch(
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
        encodeURIComponent(value)
    )
    .then(function(res) {
        return res.json();
    })
    .then(function(geoResults) {

        if (!geoResults || geoResults.length === 0) {

            resultsBox.innerHTML =
                "<p class='plot-empty'>Location not found. Try a different search.</p>";

            return;

        }

        const lat = parseFloat(geoResults[0].lat);
        const lng = parseFloat(geoResults[0].lon);


        // Step 2: Search plots within the chosen radius
        // of that location.

        fetch(
            "api/nearby_plots.php?lat=" + lat +
            "&lng=" + lng +
            "&radius=" + radius
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {

            if (!data.success) {

                resultsBox.innerHTML =
                    "<p class='plot-empty'>Something went wrong. Please try again.</p>";

                return;

            }

            renderPlotResults(data.plots, value, radius);

        })
        .catch(function() {

            resultsBox.innerHTML =
                "<p class='plot-empty'>Server error. Please make sure XAMPP is running.</p>";

        });

    })
    .catch(function() {

        resultsBox.innerHTML =
            "<p class='plot-empty'>Could not reach location search service. Check your internet connection.</p>";

    });

}


function renderPlotResults(plots, searchedLocation, radius) {

    const resultsBox =
        document.getElementById("plotResults");

    clearRouteFromMap();

    if (plots.length === 0) {

        resultsBox.innerHTML =
            "<p class='plot-empty'>No plots found within " +
            radius + " km of " + searchedLocation + ".</p>";

        return;

    }

    const bounds = new google.maps.LatLngBounds();

    plots.forEach(function(plot) {

        const marker = addPlotMarker(plot);

        bounds.extend(marker.getPosition());

    });

    if (bhoomiMap) {
        bhoomiMap.fitBounds(bounds);
    }

    let html =
        "<h3 class='plot-results-title'>" +
        plots.length + " plot(s) found within " +
        radius + " km of " + searchedLocation +
        "</h3>";

    plots.forEach(function(plot) {

        const statusLabel = {
            available: "Available",
            under_acquisition: "Under Acquisition",
            acquired: "Acquired",
            disputed: "Disputed"
        }[plot.status] || plot.status;

        const statusClass = {
            available: "success",
            under_acquisition: "warning-status",
            acquired: "",
            disputed: "danger"
        }[plot.status] || "";

        html +=
            "<div class='plot-result-card'>" +
                "<div>" +
                    "<strong>" + plot.name + "</strong>" +
                    "<span>" + plot.district + ", " + plot.state + "</span>" +
                "</div>" +
                "<div class='plot-result-meta'>" +
                    "<span>" + plot.area_acres + " Acres</span>" +
                    "<span>" + plot.distance_km + " km away</span>" +
                "</div>" +
                "<span class='status " + statusClass + "'>" +
                    statusLabel +
                "</span>" +
            "</div>";

    });

    resultsBox.innerHTML = html;

}


/* =========================================================
   TABLE SEARCH
========================================================= */

function searchTable(input, tableId) {

    const filter =
        input.value.toLowerCase();

    const table =
        document.getElementById(tableId);

    const rows =
        table.querySelectorAll("tbody tr");


    rows.forEach(function(row) {

        const text =
            row.textContent.toLowerCase();

        row.style.display =
            text.includes(filter)
                ? ""
                : "none";

    });

}


/* =========================================================
   AI ANALYSIS
========================================================= */

function runAIAnalysis() {

    notifyUser(
        "AI analysis completed. Risk indicators updated."
    );

}


/* =========================================================
   PROJECT MODAL
========================================================= */

function openProjectModal() {

    document.getElementById("projectModal")
        .classList.remove("hidden");

}


function closeProjectModal() {

    document.getElementById("projectModal")
        .classList.add("hidden");

}


function createProject() {

    const name =
        document.getElementById("newProjectName")
            .value
            .trim();

    const location =
        document.getElementById("newProjectLocation")
            .value
            .trim();


    if (!name || !location) {

        notifyUser(
            "Please enter project name and location."
        );

        return;

    }


    closeProjectModal();


    document.getElementById("newProjectName")
        .value = "";

    document.getElementById("newProjectLocation")
        .value = "";


    notifyUser(
        "Project '" +
        name +
        "' created successfully for " +
        location +
        "."
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

document.querySelectorAll(".mobile-menu")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            const application = button.closest(".application");

            const sidebar =
                application.querySelector(".sidebar");

            const overlay =
                application.querySelector(".sidebar-overlay");

            sidebar.classList.toggle("open");

            if (overlay) {
                overlay.classList.toggle("show");
            }

        });

    });


function closeSidebar(applicationId) {

    const application =
        document.getElementById(applicationId);

    const sidebar =
        application.querySelector(".sidebar");

    const overlay =
        application.querySelector(".sidebar-overlay");

    sidebar.classList.remove("open");

    if (overlay) {
        overlay.classList.remove("show");
    }

}


// Auto-close the sidebar on mobile after picking a menu item,
// so users don't have to manually close it every time.

document.querySelectorAll(".nav-item, .owner-nav-item")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            if (window.innerWidth > 750) {
                return;
            }

            const application =
                button.closest(".application");

            closeSidebar(application.id);

        });

    });


/* =========================================================
   RESTORE SESSION
========================================================= */

window.addEventListener("load", function() {

    const savedUser =
        localStorage.getItem(
            "bhoomiCurrentUser"
        );


    if (!savedUser) {
        return;
    }


    try {

        currentUser =
            JSON.parse(savedUser);


        if (
            currentUser.role === "government"
        ) {

            openGovernmentApp();

        }

        else if (
            currentUser.role === "landowner"
        ) {

            openLandOwnerApp();

        }

    }

    catch {

        localStorage.removeItem(
            "bhoomiCurrentUser"
        );

    }

});