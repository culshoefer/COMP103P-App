///<reference path="../ajax.ts"/>
///<reference path="../scripts.ts"/>
///<reference path="../jquery.d.ts"/>
/**
 * @author Christoph Ulshoefer <christophsulshoefer@gmail.com>
 *
 * @copyright 2016
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @version 0.0.6
 *
 */
var fakeJSON_obj_oneProgramme = {
    "error": null,
    "name": "Some programme",
    "target_group": ["Young people", "Old people", "Twentysomething people"],
    "current_target_group": 0,
    "target_group_comment": "This is an exceptional programme",
    "start_date": "1834-01-22 02:00:00",
    "end_date": "1834-02-22 02:00:00",
    "participants": [
        {
            "given_name": "Peter",
            "last_name": "Parker",
            "id": "13"
        },
        {
            "given_name": "Michael",
            "last_name": "Jackdaughter",
            "id": "12"
        },
        {
            "given_name": "Rowan",
            "last_name": "@kinson",
            "id": "1"
        }
    ]
};
//var fakeJSON_oneProgramme = <JSON> fakeJSON_obj_oneProgramme;
var fakeJSON_obj_programmeMenu = {
    "error": null,
    "programmes": [
        {
            "name": "Programme 1",
            "start_date": "1834-02-22 02:00:00",
            "end_date": "1834-02-22 02:00:00",
            "id": "1"
        },
        {
            "name": "Programme 2",
            "start_date": "1834-02-22 02:00:00",
            "end_date": "1834-02-22 02:00:00",
            "id": "2"
        },
        {
            "name": "Programme 1",
            "start_date": "1834-02-22 02:00:00",
            "end_date": "1834-02-22 02:00:00",
            "id": "3"
        }
    ]
};
var fakeJSON_menu = fakeJSON_obj_programmeMenu;
//var fakeJSON_programmeMenu = <JSON> fakeJSON_obj_programmeMenu;
/**
 * Class to store the token field (the field to add/remove users from a program)
 * @version 0.0.2
 * TODO get people's names (--> or display more information?) from the database who are not yet in the program
 */
var ValidatorTokenField = (function () {
    function ValidatorTokenField() {
    }
    ValidatorTokenField.prototype.load = function () {
        this.setUp();
    };
    ValidatorTokenField.prototype.setUp = function () {
        this.setSuggestionEngine();
        this.displayTokenField();
        this.preventDuplicates();
    };
    /**
     * Initially sets up the engine of suggestions, stores the state in this.engine
     * @since 0.0.1
     */
    ValidatorTokenField.prototype.setSuggestionEngine = function () {
        //   docs for bloodhound suggestion engine https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md
        this.engine = new Bloodhound({
            local: [{ value: 'red' }, { value: 'Tim' }, { value: 'Peter' }, { value: 'Christoph' }],
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.value);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        this.engine.initialize();
    };
    /**
     * Checks if one of the tokens entered is a duplicate of an existing one.
     * @since 0.0.4
     */
    ValidatorTokenField.prototype.preventDuplicates = function () {
        $('#person-input').on('tokenfield:createToken', function (e) {
            console.log('...checking if too many tokens');
            var existingTokens = this.tf('getTokens');
            $.each(existingTokens, function (i, tok) {
                if (tok.value === e.attrs.value) {
                    e.preventDefault();
                }
            });
        });
    };
    /**
     * Displays the token field in the DOM and sets a reference to the object in instance variable tf
     * @since 0.0.1
     */
    ValidatorTokenField.prototype.displayTokenField = function () {
        this.tf = $('#person-input').tokenfield({
            typeahead: [null, { source: this.engine.ttAdapter() }]
        });
    };
    return ValidatorTokenField;
})();
/**
 * Defines the menu/table on the left of the view.
 * TODO hook up to API (display first programme)
 * TODO do quick search
 * TODO do the animation of displaying the programme on the right if the user clicks on it
 * TODO: Animation for when going to a programme
 * @version 0.0.4
 */
var ProgrammeTable = (function () {
    function ProgrammeTable() {
    }
    /**
     * Loads up all of the information and sets up the instance variables
     */
    ProgrammeTable.prototype.load = function () {
        this.pagination = $('#pagination');
        this.page = 1;
        this.setUp();
    };
    /**
     * Creates the basic structure of the table
     */
    ProgrammeTable.prototype.setUp = function () {
        var that = this;
        var loader = LoaderManager.createLoader($('#table-body'));
        LoaderManager.showLoader((loader), function () {
            that.makeAddButton();
            that.setUpPagination();
            AJAX.fakeGet(fakeJSON_menu, function (data) {
                that.addDataToTable(data);
            }, function (message) {
                Util.error('An error has occurred during the loading of the list of programmes. Please reload the page or contact the administrator. Error message: ' + message);
            });
        });
        LoaderManager.hideLoader(loader, function () {
            LoaderManager.destroyLoader(loader);
        });
    };
    /**
     * Creates a new programme specified by the user. Pops up a modal to get name/start/end date and then goes to the view
     */
    ProgrammeTable.prototype.addProgramme = function () {
        //console.log("adding programme...");
    };
    /**
     * Sets up the pagination
     * @since 0.0.4
     */
    ProgrammeTable.prototype.setUpPagination = function () {
        var that = this;
        this.pagination.pagination({
            items: 0,
            itemsOnPage: 10,
            onPageClick: function (page, event) {
                if (event != null) {
                    event.preventDefault();
                }
                that.page = page;
            }
        });
    };
    /**
     * Links up the button for adding programmes with the JS
     */
    ProgrammeTable.prototype.makeAddButton = function () {
        $('#add-programme').click(this.addProgramme);
    };
    /**
     * With the data of all the programmes, it successively creates the rows for each programme
     * @param data
     */
    ProgrammeTable.prototype.addDataToTable = function (data) {
        for (var i = 0; i < data.programmes.length; i++) {
            var item = data.programmes[i];
            this.addRowToTable(item);
        }
    };
    /**
     * Successively adds the parameters to one row and adds it to the DOM
     * @param data
     */
    ProgrammeTable.prototype.addRowToTable = function (data) {
        var row;
        var startD;
        var endD;
        var that = this;
        startD = Util.formatShortDate(Util.parseSQLDate(data.start_date));
        endD = Util.formatShortDate(Util.parseSQLDate(data.end_date));
        row = $('<tr></tr>');
        row.append('<td>' + data.name + '</td>');
        row.append('<td>' + startD + ' - ' + endD + '</td>');
        row.click(function () {
            that.displayProgramme.call(null, data.id);
        });
        $('#table-body').append(row);
    };
    ProgrammeTable.prototype.displayProgramme = function (programmeId) {
        window.location.href = window.location.origin + '/programme/view/' + programmeId;
    };
    return ProgrammeTable;
})();
/**
 * carries out all the tasks related to displaying the actual information of one programme on the right of the view
 * @since 0.0.3
 * TODO: Make the add new person thing work
 * TODO: autosave
 */
var ProgrammeInformation = (function () {
    function ProgrammeInformation() {
    }
    /**
     * Loads up all of the information and sets up the instance variables
     */
    ProgrammeInformation.prototype.load = function () {
        this.setUp();
    };
    /**
     * Creates the basic structure of the table
     */
    ProgrammeInformation.prototype.setUp = function () {
        var that = this;
        var loader = LoaderManager.createLoader($('#programmeContent'));
        LoaderManager.showLoader((loader), function () {
            that.displayTitle("Second year placements");
            that.displayPeople(fakeJSON_obj_oneProgramme.participants);
            that.displayTargetGroup(fakeJSON_obj_oneProgramme.target_group, fakeJSON_obj_oneProgramme.current_target_group);
            that.displayComment(fakeJSON_obj_oneProgramme.target_group_comment);
            that.displayStartDate(fakeJSON_obj_oneProgramme.start_date);
            that.displayEndDate(fakeJSON_obj_oneProgramme.end_date);
            $('.undefined').html = "";
        });
        LoaderManager.hideLoader(loader, function () {
            LoaderManager.destroyLoader(loader);
        });
    };
    /**
     * Displays the title of the programme in the dedicated textfield
     * @param title
     */
    ProgrammeInformation.prototype.displayTitle = function (title) {
        $('#programme-title').val(title);
    };
    /**
     * Shows the target group as dropdown
     * @param options
     * @param active
     */
    ProgrammeInformation.prototype.displayTargetGroup = function (options, active) {
        var dropD = $('#target-dropdown');
        dropD.append('<li class="dropdown-header">Choose a target group:</li>');
        $('#target-button').append(options[active]);
        for (var i = 0; i < options.length; i++) {
            dropD.append('<li><a>' + options[i] + '</a></li>');
        }
    };
    /**
     * Displays the comment for the target group
     * @param initialData
     */
    ProgrammeInformation.prototype.displayComment = function (initialData) {
        $('#target-comment').val(initialData);
    };
    /**
     * Displays the start date of the programme
     * @param sqlDate
     */
    ProgrammeInformation.prototype.displayStartDate = function (sqlDate) {
        var startD = Util.formatNumberDate(Util.parseSQLDate(sqlDate));
        var startDate = Util.getDatePicker(startD, "add-start-date");
        $('#start-date').append(startDate);
    };
    /**
     * Displays the end date of the programme
     * @param sqldate
     */
    ProgrammeInformation.prototype.displayEndDate = function (sqldate) {
        var endD = Util.formatNumberDate(Util.parseSQLDate(sqldate));
        var endDate = Util.getDatePicker(endD, "add-start-date");
        $('#end-date').append(endDate);
    };
    /**
     * Creates the table with all the people in a programme
     * @param people
     */
    ProgrammeInformation.prototype.displayPeople = function (people) {
        var table = $('#existingPeople');
        for (var i = 0; i < people.length; i++) {
            var row = $('<td></td>');
            row.append(people[i].given_name + ' ' + people[i].last_name);
            var fullRow = $('<tr></tr>');
            fullRow.append(row);
            var that = this;
            var personId = people[i].id;
            fullRow.click(function () {
                that.goToView.call(null, personId);
            });
            table.append(fullRow);
        }
    };
    /**
     * Changes to the specified record
     * @param id
     */
    ProgrammeInformation.prototype.goToView = function (id) {
        console.log('going to view...');
        window.location.href = window.location.origin + '/record/view/' + id;
    };
    return ProgrammeInformation;
})();
$(document).ready(function () {
    new ValidatorTokenField().load();
    new ProgrammeInformation().load();
    new ProgrammeTable().load();
});
