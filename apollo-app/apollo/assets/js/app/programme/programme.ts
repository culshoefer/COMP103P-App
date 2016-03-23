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

var fakeJSON_obj_programmeMenu: MenuData = {
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

var fakeJSON_menu = <JSON> fakeJSON_obj_programmeMenu;

interface ParticipantData {
    given_name:string,
    last_name:string,
    id:string
}

interface ShortProgrammeData {
    name:string,
    start_date:string,
    end_date:string,
    id:string
}

interface MenuData {
    error:Error,
    programmes:ShortProgrammeData[]
}
interface DetailProgrammeData {
    error:Error,
    name:string,
    target_group:string[],
    target_group_comment:string,
    start_date:string,
    end_date:string,
    participants:ParticipantData[]
}

//var fakeJSON_programmeMenu = <JSON> fakeJSON_obj_programmeMenu;


/**
 * Class to store the token field (the field to add/remove users from a program)
 * @version 0.0.2
 * TODO get people's names (--> or display more information?) from the database who are not yet in the program
 */
class ValidatorTokenField {
    private engine:BloodHound;
    private tf; //consider refactoring this
    public load(){
        this.setUp();
    }

    private setUp() {
        this.setSuggestionEngine();
        this.displayTokenField();
        this.preventDuplicates();
    }

    /**
     * Initially sets up the engine of suggestions, stores the state in this.engine
     * @since 0.0.1
     */
    private setSuggestionEngine() {
        //   docs for bloodhound suggestion engine https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md
        this.engine = new Bloodhound({
            local: [{value: 'red'}, {value: 'Tim'}, {value: 'Peter'}, {value: 'Christoph'}],
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.value);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
        });
        this.engine.initialize();
    }

    /**
     * Checks if one of the tokens entered is a duplicate of an existing one.
     * @since 0.0.4
     */
    private preventDuplicates(){
        $('#person-input').on('tokenfield:createToken', function(e) {
            console.log('...checking if too many tokens');
            var existingTokens = this.tf('getTokens');
            $.each(existingTokens, function(i, tok) {
                if (tok.value === e.attrs.value){
                    e.preventDefault();
                }});
        });
    }

    /**
     * Displays the token field in the DOM and sets a reference to the object in instance variable tf
     * @since 0.0.1
     */
    private displayTokenField() {
        this.tf = $('#person-input').tokenfield({
            typeahead: [null, {source: this.engine.ttAdapter()}]
        });
    }

}

/**
 * Defines the menu/table on the left of the view.
 * TODO hook up to API (display first programme)
 * TODO do quick search
 * TODO do the animation of displaying the programme on the right if the user clicks on it
 * TODO: Animation for when going to a programme
 * @version 0.0.4
 */
class ProgrammeTable {

    private pagination:JQuery;
    private page:number;

    /**
     * Loads up all of the information and sets up the instance variables
     */
    public load() {
        this.pagination = $('#pagination');
        this.page = 1;
        this.setUp();
    }

    /**
     * Creates the basic structure of the table
     */
    private setUp() {
        var that = this;
        var loader = LoaderManager.createLoader($('#table-body'));
        LoaderManager.showLoader((loader), function() {
            that.makeAddButton();
            that.setUpPagination();
            AJAX.fakeGet(fakeJSON_menu, function(data:MenuData) {
                that.addDataToTable(data);
            }, function (message:string) {
                Util.error('An error has occurred during the loading of the list of programmes. Please reload the page or contact the administrator. Error message: ' + message);
            });
        });
        LoaderManager.hideLoader(loader, function () {
            LoaderManager.destroyLoader(loader);
        });
    }

    /**
     * Creates a new programme specified by the user. Pops up a modal to get name/start/end date and then goes to the view
     */
    private addProgramme() {
        //console.log("adding programme...");
    }

    /**
     * Sets up the pagination
     * @since 0.0.4
     */
    private setUpPagination() {
        var that = this;
        this.pagination.pagination({
            items: 0,
            itemsOnPage: 10,
            onPageClick: function (page, event) {
                if(event != null) {
                    event.preventDefault();
                }
                that.page = page;
            }
        });
    }

    /**
     * Links up the button for adding programmes with the JS
     */
    private makeAddButton() {
        $('#add-programme').click(this.addProgramme);
    }

    /**
     * With the data of all the programmes, it successively creates the rows for each programme
     * @param data
     */
    private addDataToTable(data:MenuData) {
        for (var i = 0; i < data.programmes.length; i++) {
            var item:ShortProgrammeData = data.programmes[i];
            this.addRowToTable(item);
        }
    }

    /**
     * Successively adds the parameters to one row and adds it to the DOM
     * @param data
     */
    private addRowToTable(data:ShortProgrammeData) {
        var row:JQuery;
        var startD;
        var endD;
        var that = this;
        startD = Util.formatShortDate(Util.parseSQLDate(<string> data.start_date));
        endD = Util.formatShortDate(Util.parseSQLDate(<string> data.end_date));
        row = $('<tr></tr>');
        row.append('<td>' + data.name + '</td>');
        row.append('<td>' + startD + ' - ' + endD + '</td>');
        row.click(function() {
            that.displayProgramme.call(null, data.id);
        });
        $('#table-body').append(row);
    }

    private displayProgramme(programmeId:string) {
        window.location.href = window.location.origin + '/programme/view/' + programmeId;
    }
}

/**
 * carries out all the tasks related to displaying the actual information of one programme on the right of the view
 * @since 0.0.3
 * TODO: Make the add new person thing work
 * TODO: autosave
 */
class ProgrammeInformation {

    /**
     * Loads up all of the information and sets up the instance variables
     */
    public load(){
        this.setUp();
    }

    /**
     * Creates the basic structure of the table
     */
    private setUp(){
        var that = this;
        var loader = LoaderManager.createLoader($('#programmeContent'));
        LoaderManager.showLoader((loader), function() {
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
    }

    /**
     * Displays the title of the programme in the dedicated textfield
     * @param title
     */
    private displayTitle(title:string){
        $('#programme-title').val(title);
    }

    /**
     * Shows the target group as dropdown
     * @param options
     * @param active
     */
    private displayTargetGroup(options:string[], active:number){
        var dropD = $('#target-dropdown');
        dropD.append('<li class="dropdown-header">Choose a target group:</li>');
        $('#target-button').append(options[active]);
        for(var i = 0; i < options.length; i++) {
                dropD.append('<li><a>' + options[i] + '</a></li>');
        }
    }

    /**
     * Displays the comment for the target group
     * @param initialData
     */
    private displayComment(initialData:string){
        $('#target-comment').val(initialData);
    }


    /**
     * Displays the start date of the programme
     * @param sqlDate
     */
    private displayStartDate(sqlDate:string){
        var startD:string = Util.formatNumberDate(Util.parseSQLDate(<string> sqlDate));
        var startDate = Util.getDatePicker(startD, "add-start-date");
        $('#start-date').append(startDate);
    }

    /**
     * Displays the end date of the programme
     * @param sqldate
     */
    private displayEndDate(sqldate:string){
        var endD:string = Util.formatNumberDate(Util.parseSQLDate(<string> sqldate));
        var endDate = Util.getDatePicker(endD, "add-start-date");
        $('#end-date').append(endDate);
    }

    /**
     * Creates the table with all the people in a programme
     * @param people
     */
    private displayPeople(people:ParticipantData[]){
        var table = $('#existingPeople');
        for(var i = 0; i < people.length; i++) {
            var row = $('<td></td>');
            row.append(people[i].given_name + ' ' + people[i].last_name);
            var fullRow = $('<tr></tr>');
            fullRow.append(row);
            var that = this;
            var personId = people[i].id;
            fullRow.click(function() {
                that.goToView.call(null, personId);
            });
            table.append(fullRow);
        }
    }

    /**
     * Changes to the specified record
     * @param id
     */
    private goToView(id:string){
        console.log('going to view...');
        window.location.href = window.location.origin + '/record/view/' + id;
    }
}

$(document).ready(function () {
    new ValidatorTokenField().load();
    new ProgrammeInformation().load();
    new ProgrammeTable().load();
});

