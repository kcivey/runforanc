jQuery(function ($) {

    $('#form-search').submit(function (evt) {
        var searchData = {},
            button = $('button', this),
            resetButton = function () {
                button.text('Search').removeAttr('disabled');
            },
            timeoutHandle;
        evt.preventDefault();
        $.each(['q', 'name', 'address'], function (i, name) {
            var value = $('#' + name).val();
            if (value) {
                searchData[name] = value;
            }
        });
        if ($.isEmptyObject(searchData)) {
            return; // don't search if no search terms
        }
        button.text('Please Wait').attr('disabled', 'disabled');
        $('#results, #explanation').empty();
        // Use a timeout because JSONP calls don't always raise error
        // events when there's a problem.
        timeoutHandle = setTimeout(
            function () {
                alert('Something unexpected went wrong with the search request. Trying again might work.');
                resetButton();
            },
            10000
        );
        $.ajax({
            url: 'http://' + window.location.host + ':3000/search',
            data: searchData,
            dataType: 'jsonp',
            success: handleResults,
            complete: function () {
                clearTimeout(timeoutHandle);
                resetButton();
            }
        });
    });

    function handleResults(data) {
        var tbody = $('#results'),
            rowTemplate = _.template($('#row-template').html())
            results = data.results;
        $('#result-div table').toggleClass('hide', results.length ? false : true);
        $('#none-found').toggleClass('hide', results.length ? true : false);
        $.each(results, function (i, r) {
            tbody.append(rowTemplate(r));
        });
        $('#explanation').append(data.explanation).removeClass('hide');
    }
});
