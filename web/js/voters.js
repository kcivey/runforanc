jQuery(function ($) {

    $('#form-search').submit(function (evt) {
        var searchData = {},
            button = $('button', this);
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
        $('#results').empty();
        $.ajax({
            url: 'http://' + window.location.host + ':3000/search',
            data: searchData,
            dataType: 'jsonp',
            success: handleResults,
            complete: function () { button.text('Search').removeAttr('disabled'); }
        });
    });

    function handleResults(data) {
        var tbody = $('#results'),
            rowTemplate = _.template($('#row-template').html());
        $('#result-div table').toggleClass('hide', data.length ? false : true);
        $('#none-found').toggleClass('hide', data.length ? true : false);
        $.each(data, function (i, r) {
            tbody.append(rowTemplate(r));
        });
    }
});
