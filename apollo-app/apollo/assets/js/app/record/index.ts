///<reference path="../ajax.ts"/>
///<reference path="../scripts.ts"/>
///<reference path="../../typings/jquery.d.ts"/>
///<reference path="../../typings/bootbox.d.ts"/>
///<reference path="../columns.ts"/>
/**
 * Records index typescript
 *
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @author Christoph Ulshoefer <christophsulshoefer@gmail.com>
 * @copyright 2016
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @version 0.0.7
 */

interface RecordData {
    id:number,
    given_name:string,
    middle_name:string,
    last_name:string,
    email:string,
    phone:string,
}
interface TableData {
    error:Error,
    count:number,
    data:RecordData[]
}

class RecordTable {

    private table:JQuery;
    private pagination:JQuery;
    private loader:number;
    private page:number;
    private sort:number;
    private search:string;

    public load() {
        this.table = $('#table-body');
        this.pagination = $('#pagination');
        this.loader = LoaderManager.createLoader($('.table-responsive.loader-ready'));
        this.page = 1;
        this.sort = 1;
        this.search = '';
        this.setup();
        this.updateTable();
    }

    private setup() {
        var that = this;
        this.pagination.pagination({
            items: 0,
            itemsOnPage: 10,
            onPageClick: function (page, event) {
                if(event != null) {
                    event.preventDefault();
                }
                that.page = page;
                that.updateTable();
            }
        });
        this.addTabFunctions();
        this.addRecordClick();
        this.addAutoSearch();
    }

    private addTabFunctions() {
        var that = this;
        $('#sort-tabs').on('click', '.sort-tab', function () {
            $('.sort-tab').removeClass('active');
            $(this).addClass('active');
            that.sort = $(this).data('sort');
            that.updateTable();
        });
    }

    private addRecordClick() {
        this.table.on('click', '.record-tr', function (e) {
            e.preventDefault();
            WebUtil.to('record/view/' + $(this).data('id'));
        });
    }

    private addAutoSearch() {
        var that = this;
        var timer = null;
        $('#records-search').keyup(function () {
            clearTimeout(timer);
            that.search = encodeURIComponent($(this).val());
            timer = setTimeout(function () {
                that.updateTable();
            }, AJAX_DELAY);
        });
    }

    private updateTable() {
        var that = this;
        LoaderManager.showLoader(that.loader, function () {
            AJAX.get(StringUtil.url('get/records/?page=' + that.page + '&sort=' + that.sort + '&search=' + that.search, false), function (data:TableData) {
                if(data.count < (that.page - 1) * 10) {
                    that.pagination.pagination('selectPage', data.count / 10 - data.count % 10);
                    return;
                }
                that.pagination.pagination('updateItems', data.count);
                that.table.html('');
                if (data.count > 0) {
                    for (var i = 0; i < data.data.length; i++) {
                        that.renderTr(data.data[i]);
                    }
                } else {
                    that.table.append('<tr><td colspan="4" class="text-center"><b>Nothing to display . . .</b></td></tr>');
                }
                LoaderManager.hideLoader(that.loader);
            }, function (message:string) {
                WebUtil.error('An error has occurred during the loading of the list of records. Please reload the page or contact the administrator. Error message: ' + message);
            });
        });
    }

    private renderTr(data:RecordData) {
        var tr = $('<tr class="record-tr clickable" data-id="' + data.id + '"></tr>');
        [data.given_name, data.last_name, data.email, data.phone].forEach(function(string) {
            var td = $('<td></td>');
            var field = new DataText(StringUtil.shortify(string, 50));
            field.renderPlain(td);
            tr.append(td);
        });
        this.table.append(tr);
    }

}

$(document).ready(function () {
    new RecordTable().load();
    $('#add-record').click(function(e) {
        e.preventDefault();
        bootbox.dialog({
                title: 'Creating a new person and a record',
                message: $('#add-modal').html(),
                buttons: {
                    main: {
                        label: "Cancel",
                        className: "btn-primary",
                        callback: function () {
                        }
                    },
                    success: {
                        label: "Add",
                        className: "btn-success",
                        callback: function () {
                            var modal = $('.modal');
                            var givenName = modal.find('#add-given-name').val();
                            var middleName = modal.find('#add-middle-name').val();
                            var lastName = modal.find('#add-last-name').val();
                            var recordName = modal.find('#add-record-name').val();
                            var startDate = DateUtil.toMysqlFormat(modal.find('#add-start-date').datepicker('getDate'));
                            var endDate = DateUtil.toMysqlFormat(modal.find('#add-end-date').datepicker('getDate'));
                            AJAX.post(StringUtil.url('post/record'), {
                                action: 'create',
                                given_name: givenName,
                                middle_name: middleName,
                                last_name: lastName,
                                record_name: recordName,
                                start_date: startDate,
                                end_date: endDate
                            }, function (response:any) {
                                WebUtil.to('record/edit/' + response.record_id);
                            }, function (message:string) {
                                WebUtil.error('An error has occurred during the process of creation of a new record for a person. Error message: ' + message);
                            });
                        }
                    }
                }
            }
        );
    });
});