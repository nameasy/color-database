$(function () {
    $(".cd-table").each(function () {
        if ($(this).find("thead").length > 0 && $(this).find("th").length > 0) {
            // Clone <thead>
            var w = $(window),
                t = $(this),
                thead = t.find("thead").clone(),
                col = t.find("thead, tbody").clone();
            // Add class, remove margins, reset width and wrap table
            t.addClass("cd-sticky-table").css({
                margin: 0,
                width: "100%"
            }).wrap("<div class='cd-sticky' />");

            /* t.parent().append($('<button>', {
                'class': 'cd-sticky-btn',
                'text': 'Развернуть'
            })); */

            if (t.hasClass("overflow-y")) t.removeClass("overflow-y").parent().addClass("overflow-y");
            // Create new sticky table head (basic)
            t.after("<table class='cd-sticky-row' />");
            // If <tbody> contains <th>, then we create sticky column and intersect (advanced)
            if (t.find("tbody th").length > 0) {
                t.after("<table class='cd-sticky-col' /><table class='cd-sticky-intersect' />");
            }
            // Create shorthand for things
            var stickyRow = $(this).siblings(".cd-sticky-row"),
                stickyCol = $(this).siblings(".cd-sticky-col"),
                stickyIntersect = $(this).siblings(".cd-sticky-intersect"),
                sticky = $(this).parent(".cd-sticky");
            stickyRow.append(thead);
            stickyCol.append(col).find("thead th:gt(0)").remove().end().find("tbody td").remove();
            stickyIntersect.html("<thead><tr><th>" + t.find("thead th:first-child").html() + "</th></tr></thead>");
            // Set widths
            var setWidths = function () {
                    t.find("thead th").each(function (i) {
                        stickyRow.find("th").eq(i).width($(this).width());
                    }).end().find("tr").each(function (i) {
                        stickyCol.find("tr").eq(i).height($(this).height());
                    });
                    // Set width of sticky table head
                    stickyRow.width(t.width());
                    // Set width of sticky table col
                    stickyCol.find("th").add(stickyIntersect.find("th")).width(t.find("thead th").width())
                },
                repositionStickyRow = function () {
                    // Return value of calculated allowance
                    var allowance = calcAllowance();
                    // Check if wrapper parent is overflowing along the y-axis
                    if (t.height() > sticky.height()) {
                        // If it is overflowing (advanced layout)
                        // Position sticky header based on wrapper scrollTop()
                        if (sticky.scrollTop() > 0) {
                            // When top of wrapping parent is out of view
                            stickyRow.add(stickyIntersect).css({
                                opacity: 1,
                                top: sticky.scrollTop()
                            });
                        } else {
                            // When top of wrapping parent is in view
                            stickyRow.add(stickyIntersect).css({
                                opacity: 0,
                                top: 0
                            });
                        }
                    } else {
                        // If it is not overflowing (basic layout)
                        // Position sticky header based on viewport scrollTop
                        if (w.scrollTop() > t.offset().top && w.scrollTop() < t.offset().top + t.outerHeight() - allowance) {
                            // When top of viewport is in the table itself
                            stickyRow.add(stickyIntersect).css({
                                opacity: 1,
                                top: w.scrollTop() - t.offset().top
                            });
                        } else {
                            // When top of viewport is above or below table
                            stickyRow.add(stickyIntersect).css({
                                opacity: 0,
                                top: 0
                            });
                        }
                    }
                },
                repositionStickyCol = function () {
                    if (sticky.scrollLeft() > 0) {
                        // When left of wrapping parent is out of view
                        stickyCol.add(stickyIntersect).css({
                            opacity: 1,
                            left: sticky.scrollLeft()
                        });
                    } else {
                        // When left of wrapping parent is in view
                        stickyCol.css({
                            opacity: 0
                        }).add(stickyIntersect).css({
                            left: 0
                        });
                    }
                },
                calcAllowance = function () {
                    var a = 0;
                    // Calculate allowance
                    t.find("tbody tr:lt(3)").each(function () {
                        a += $(this).height();
                    });
                    // Set fail safe limit (last three row might be too tall)
                    // Set arbitrary limit at 0.25 of viewport height, or you can use an arbitrary pixel value
                    if (a > w.height() * 0.25) {
                        a = w.height() * 0.25;
                    }
                    // Add the height of sticky header
                    a += stickyRow.height();
                    return a;
                };
            setWidths();
            t.parent(".cd-sticky").scroll($.throttle(125, function () {
                repositionStickyRow();
                repositionStickyCol();
            }));
            w.load(setWidths).resize($.debounce(125, function () {
                setWidths();
                repositionStickyRow();
                repositionStickyCol();
            })).scroll($.throttle(125, repositionStickyRow));
        }
    });
});