///<reference path="jquery.d.ts"/>
///<reference path="scripts.ts"/>
/**
 * Column manager typescript
 *
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @version 0.0.5
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ColumnManager = (function () {
    function ColumnManager(target, columnCount, totalRows) {
        if (columnCount === void 0) { columnCount = 3; }
        if (totalRows === void 0) { totalRows = null; }
        this.targetSelector = target;
        this.target = $(target);
        this.container = $('<div class="row top-buffer"></div>');
        this.columnCount = columnCount;
        this.columns = [];
        for (var i = 0; i < columnCount; i++) {
            this.columns[i] = new Column(this.container);
        }
        this.totalRows = totalRows;
    }
    ColumnManager.prototype.add = function (row) {
        if (this.totalRows == null) {
            var bestColumn = this.columns[0];
            for (var i = 0; i < this.columnCount; i++) {
                var column = this.columns[i];
                if (column.countRows() < bestColumn.countRows()) {
                    bestColumn = column;
                }
            }
            bestColumn.addToBack(row);
        }
        else {
            for (var i = 0; i < this.columnCount; i++) {
                var column = this.columns[i];
                if (column.countRows() < this.totalRows / 3) {
                    column.addToBack(row);
                    break;
                }
            }
        }
    };
    ColumnManager.prototype.addToColumn = function (index, row) {
        this.columns[index].addToBack(row);
    };
    ColumnManager.prototype.render = function (overwriteContent) {
        if (overwriteContent === void 0) { overwriteContent = true; }
        if (overwriteContent) {
            this.target.html('');
        }
        for (var i = 0; i < this.columnCount; i++) {
            this.columns[i].render();
        }
        this.target.append(this.container);
    };
    return ColumnManager;
}());
var Column = (function () {
    function Column(target) {
        this.target = target;
        this.rows = [];
    }
    Column.prototype.addToFront = function (row) {
        this.rows.unshift(row);
    };
    Column.prototype.addToBack = function (row) {
        this.rows.push(row);
    };
    Column.prototype.render = function () {
        var column = $('<table class="table no-border-top"></table>');
        for (var i = 0; i < this.rows.length; i++) {
            this.rows[i].render(column);
        }
        var responsive = $('<div class="table-responsive"></div>');
        responsive.append(column);
        var bootstrapColumn = $('<div class="col-md-4"></div>');
        bootstrapColumn.append(responsive);
        this.target.append(bootstrapColumn);
    };
    Column.prototype.countRows = function () {
        return this.rows.length;
    };
    return Column;
}());
var ColumnRow = (function () {
    function ColumnRow(key, value) {
        this.key = key;
        this.value = value;
    }
    ColumnRow.prototype.render = function (target) {
        var rowHTML = $('<tr></tr>');
        rowHTML.append($('<td><small>' + this.key + '</small></td>'));
        var valueTD = $('<td></td>');
        this.value.render(valueTD);
        rowHTML.append(valueTD);
        target.append(rowHTML);
    };
    return ColumnRow;
}());
var DataField = (function () {
    function DataField(value) {
        this.parentNode = $('<div class="apollo-data-container"></div>');
        this.parentNode.html(this.parse(value));
    }
    DataField.prototype.parse = function (value) {
        if (value == null || value.length == 0) {
            return '<span class="undefined">None</span>';
        }
        return this.decorate(value);
    };
    DataField.prototype.render = function (target) {
        target.append(this.parentNode);
    };
    return DataField;
}());
var DataText = (function (_super) {
    __extends(DataText, _super);
    function DataText() {
        _super.apply(this, arguments);
    }
    DataText.prototype.decorate = function (value) {
        return Util.strong(value);
    };
    return DataText;
}(DataField));
var DataTextMultiple = (function (_super) {
    __extends(DataTextMultiple, _super);
    function DataTextMultiple() {
        _super.apply(this, arguments);
    }
    DataTextMultiple.prototype.decorate = function (value) {
        var values = '';
        for (var i = 0; i < value.length; i++) {
            var string = value[i];
            if (string == null || string.length == 0) {
                string = '<span class="undefined">None</span>';
            }
            else {
                string = Util.strong(string);
            }
            values += '<div class="apollo-data-text-multiple">' + string + '</div>';
        }
        return values;
    };
    return DataTextMultiple;
}(DataField));
var DataDate = (function (_super) {
    __extends(DataDate, _super);
    function DataDate() {
        _super.apply(this, arguments);
    }
    DataDate.prototype.decorate = function (value) {
        if (Util.isString(value)) {
            value = Util.parseSQLDate(value);
        }
        return Util.strong(Util.formatDate(value));
    };
    return DataDate;
}(DataField));
var DataDateShort = (function (_super) {
    __extends(DataDateShort, _super);
    function DataDateShort() {
        _super.apply(this, arguments);
    }
    DataDateShort.prototype.decorate = function (value) {
        if (Util.isString(value)) {
            value = Util.parseSQLDate(value);
        }
        return Util.strong(Util.formatShortDate(value));
    };
    return DataDateShort;
}(DataField));
var DataLongText = (function (_super) {
    __extends(DataLongText, _super);
    function DataLongText() {
        _super.apply(this, arguments);
    }
    DataLongText.prototype.decorate = function (value) {
        return Util.strong(value.replace(/\n/gi, '<br>'));
    };
    return DataLongText;
}(DataField));
