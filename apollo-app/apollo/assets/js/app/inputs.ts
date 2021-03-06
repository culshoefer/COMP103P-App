///<reference path="../typings/jquery.d.ts"/>
///<reference path="scripts.ts"/>
/**
 * Typescript for inputs (and some other renderable elements)
 *
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2016
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @version 0.0.9
 */

/**
 * Skeleton for input objects
 *
 * @since 0.0.8 Now uses AJAX_LAZY_DELAY instead of AJAX_DELAY
 * @since 0.0.1
 */
abstract class InputField implements Renderable {

    protected id:number;
    protected callback:Function;
    protected parentNode:JQuery;
    protected timeout:number;

    constructor(id:number, callback:(id:number, value:string|string[]|number|number[]) => void) {
        this.id = id;
        this.callback = callback;
        this.parentNode = $('<div class="apollo-input-container"></div>');
    }

    public render(target:JQuery) {
        target.append(this.parentNode);
    }

    protected callbackWrapper(callback:Function) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(function () {
            callback();
        }, AJAX_LAZY_DELAY);
    }

}

/**
 * Input number
 *
 *
 */
class InputNumber extends InputField {

    private attributes:Attributes;
    public input:JQuery;

    public constructor(id:number, callback:(id:number, value:string) => void, attributes:Attributes, value:number = null) {
        super(id, callback);
        this.attributes = <Attributes> Util.mergeObjects(attributes, {
            'data-id': this.id.toString(),
            'id': 'input-number-' + this.id,
            'class': 'form-control input-sm',
            'type': 'number',
            'value': (value == null ? '' : value.toString())
        });
        this.prepareNode();
        this.setupCallback();
    }

    private prepareNode() {
        this.input = WebUtil.buildNode('input', this.attributes, null, true);
        this.parentNode.append(this.input);
    }

    private setupCallback() {
        var that = this;
        this.input.on({
            keyup: function () {
                that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
            },
            change: function () {
                that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
            }
        });
    }
}

/**
 * Disabled input
 *
 * @since 0.0.9
 */
class InputDisabled extends InputField {

    private attributes:Attributes;
    public input:JQuery;

    public constructor(id:number, callback:(id:number, value:string) => void, attributes:Attributes, value:string = null) {
        super(id, callback);
        this.attributes = <Attributes> Util.mergeObjects(attributes, {
            'data-id': this.id.toString(),
            'id': 'input-text-' + this.id,
            'class': 'form-control input-sm',
            'disabled': 'disabled',
            'type': 'text',
            'value': (value == null ? '' : value)
        });
        this.prepareNode();
    }

    private prepareNode() {
        this.input = WebUtil.buildNode('input', this.attributes, null, true);
        this.parentNode.append(this.input);
    }
}

/**
 * Input expecting text, i.e. <input type="text" ... />
 *
 * @since 0.0.1
 */
class InputText extends InputField {

    private attributes:Attributes;
    public input:JQuery;

    public constructor(id:number, callback:(id:number, value:string) => void, attributes:Attributes, value:string = null) {
        super(id, callback);
        this.attributes = <Attributes> Util.mergeObjects(attributes, {
            'data-id': this.id.toString(),
            'id': 'input-text-' + this.id,
            'class': 'form-control input-sm',
            'type': 'text',
            'value': (value == null ? '' : value)
        });
        this.prepareNode();
        this.setupCallback();
    }

    private prepareNode() {
        this.input = WebUtil.buildNode('input', this.attributes, null, true);
        this.parentNode.append(this.input);
    }

    private setupCallback() {
        var that = this;
        this.input.on({
            keyup: function () {
                that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
            }
        });
    }
}

/**
 * Field with a text area
 *
 * @since 0.0.4
 */
class InputLongText extends InputField {

    private attributes:Attributes;
    public input:JQuery;

    public constructor(id:number, callback:(id:number, value:string) => void, attributes:Attributes, value:string = null) {
        super(id, callback);
        this.attributes = <Attributes> Util.mergeObjects(attributes, {
            'data-id': this.id.toString(),
            'id': 'input-text-' + this.id,
            'class': 'form-control input-sm',
            'type': 'text'
        });
        this.prepareNode(value);
        this.setupCallback();
    }

    private prepareNode(value:string) {
        this.input = WebUtil.buildNode('textarea', this.attributes, value);
        this.parentNode.append(this.input);
    }

    private setupCallback() {
        var that = this;
        this.input.on({
            keyup: function () {
                that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
            }
        });
    }
}

/**
 * Text with an option to add new fields
 *
 * @since 0.0.3
 */
interface InputTextPair {
    node:JQuery,
    input:InputText
}
class InputTextMultiple extends InputField {

    private counter:number;
    private inputPairs:InputTextPair[];
    private attributes:Attributes;


    public constructor(id:number, callback:(id:number, value:string[]) => void, attributes:Attributes, values:string[] = []) {
        super(id, callback);
        this.counter = 0;
        this.inputPairs = [];
        this.attributes = attributes;
        this.prepareNodes(values);
    }

    private prepareNodes(values:string[]) {
        if (values.length == 0) {
            this.createInputPair();
        } else {
            for (var value in values) {
                if (values.hasOwnProperty(value)) this.createInputPair(values[value]);
            }
        }
    }

    private createInputPair(value:string = ''):InputTextPair {
        var that = this;
        var id = this.counter++;
        var node = $('<div class="apollo-input-text-multiple row" data-id="' + id + '"></div>');
        var column = $('<div class="col-md-8"></div>');
        node.append(column);
        var input = new InputText(id, this.parseCallback.bind(this), this.attributes, value);
        input.render(column);
        var addButton = $('<button class="btn btn-block btn-sm btn-primary"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>');
        addButton.on({
            click: function (e) {
                e.preventDefault();
                that.createInputPair().input.input.focus();
                that.parseCallback();
            }
        });
        node.append($('<div class="col-md-2"></div>').append(addButton));
        var removeButton = $('<button class="btn btn-block btn-sm btn-primary"><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button>');
        node.append($('<div class="col-md-2"></div>').append(removeButton));
        var inputPair:InputTextPair = {
            node: node,
            input: input
        };
        removeButton.on({
            click: function (e) {
                e.preventDefault();
                that.removeInputPair(inputPair);
                that.parseCallback();
            }
        });
        input.input.on({
            keyup: function (e) {
                var key = e.keyCode || e.charCode;
                if (key == 13) {
                    that.createInputPair().input.input.focus();
                } else if (key == 8) {
                    if (that.inputPairs.length > 1 && inputPair.input.input.val().length == 0) {
                        that.inputPairs[that.inputPairs.indexOf(inputPair) - 1].input.input.focus();
                        that.removeInputPair(inputPair);
                    }
                }
                that.parseCallback();
            }
        });
        this.inputPairs.push(inputPair);
        this.parentNode.append(node);
        return inputPair;
    }

    private removeInputPair(inputPair:InputTextPair) {
        if (this.inputPairs.length > 1) {
            inputPair.node.remove();
            this.inputPairs.splice(this.inputPairs.indexOf(inputPair), 1);
        } else {
            this.inputPairs[0].input.input.val('');
        }
    }

    private parseCallback() {
        var values = [];
        for (var i = 0; i < this.inputPairs.length; i++) {
            var inputPair = this.inputPairs[i];
            values.push(inputPair.input.input.val());
        }
        this.callbackWrapper(this.callback.bind(this, this.id, values));
    }

}

/**
 * Input with a date
 */
class InputDate extends InputField {

    private attributes:Attributes;
    public input:JQuery;

    public constructor(id:number, callback:(id:number, value:string) => void, attributes:Attributes, value:string = null) {
        super(id, callback);
        this.attributes = <Attributes> Util.mergeObjects(attributes, {
            'data-id': this.id.toString(),
            'id': 'input-date-' + this.id,
            'class': 'form-control input-sm',
            'type': 'text',
            'value': (value == null ? '' : value)
        });
        this.prepareNode();
        this.setupCallback();
    }

    private prepareNode() {
        var node = $('<div class="input-group input-sm input-block-level date" data-provide="datepicker"></div>');
        this.input = WebUtil.buildNode('input', this.attributes, null, true);
        node.append(this.input);
        node.append('<span class="input-group-addon input-sm"><i class="glyphicon glyphicon-th"></i></span>');
        this.parentNode.append(node);
    }

    private setupCallback() {
        var that = this;
        this.input.on({
            change: function () {
                that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
            }
        });
    }
}

/**
 * Bootstrap dropdown
 *
 * @since 0.0.2
 */
class InputDropdown extends InputField {

    private options:string[];
    private selected:number[];
    private allowOther:boolean;
    private value:string;
    private multiple:boolean;
    private select:JQuery;
    private input:JQuery;

    public constructor(id:number, callback:(id:number, value:string|number|number[]) => void, options:string[], selected:number|number[] = 0, allowOther:boolean = false, value:string = null, multiple:boolean = false) {
        super(id, callback);
        this.options = options;
        if (Object.prototype.toString.call(selected) === '[object Array]') {
            this.selected = <number[]> selected;
        } else {
            this.selected = [<number> selected];
        }
        this.allowOther = allowOther;
        this.value = value;
        this.multiple = multiple && !allowOther;
        this.prepareNode();
        this.setupCallback();
    }

    private prepareNode() {
        var attributes:Attributes = {
            'data-id': this.id.toString(),
            'id': 'input-dropdown-' + this.id,
            'class': 'form-control input-sm'
        };
        if (this.multiple) {
            attributes = <Attributes> Util.mergeObjects(attributes, {
                multiple: 'multiple'
            });
        }
        this.select = WebUtil.buildNode('select', attributes);
        for (var i = 0; i < this.options.length + (this.allowOther ? 1 : 0); i++) {
            var label = this.options[i];
            if (i == this.options.length) label = 'Other';
            this.select.append($('<option' + (this.selected.indexOf(i) != -1 ? ' selected' : '') + ' value="' + i + '">' + label + '</option>'));
        }
        this.parentNode.append(this.select);
        if (this.allowOther) {
            this.input = WebUtil.buildNode('input', {
                'style': 'display:none;',
                'data-id': this.id.toString(),
                'id': 'input-dropdown-other-' + this.id,
                'class': 'form-control input-sm input-dropdown-other',
                'placeholder': 'Type here...',
                'type': 'text',
                'value': (this.value == null ? '' : this.value)
            }, null, true);
            this.parentNode.append(this.input);
            if (this.selected[0] == this.options.length) this.input.show();
        }
    }

    private setupCallback() {
        var that = this;
        this.select.on({
            change: function () {
                var value = that.select.val();
                if (value == that.options.length) {
                    that.input.show();
                    that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
                } else {
                    if (that.allowOther) that.input.hide();
                    if (that.multiple) {
                        if (value == null) value = [];
                        for (var i = 0; i < value.length; i++) {
                            value[i] = parseInt(value[i]);
                        }
                    } else {
                        value = parseInt(value);
                    }
                    that.callbackWrapper(that.callback.bind(null, that.id, value));
                }
            }
        });
        if (this.allowOther) {
            this.input.on({
                keyup: function () {
                    that.callbackWrapper(that.callback.bind(null, that.id, that.input.val()));
                }
            });
        }
    }
}

