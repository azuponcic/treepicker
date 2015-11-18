(function($) {

    // Instance ID counter
    var treebrowser_guid = 0;

    var CLASS_INPUT = 'js-coral-treebrowser-input',
        CLASS_BUTTON = 'js-coral-treebrowser-button',
        CLASS_COLLAPSED = 'is-collapsed',
        CLASS_DISABLED = 'is-disabled',
        CLASS_HIGHLIGHTED = 'is-highlighted',
        CLASS_TAGLIST = 'js-TreePickerField-tagList',

        HTML_WAIT = '<div class="coral-Wait coral-Wait--large coral-Wait--center"></div>',

        PATH_SEPARATOR = "/";

    var Registry = function() {
        var map = {};

        return {
            register: function(key, config) {
                if (!map.hasOwnProperty(key)) {
                    map[key] = [config];
                } else {
                    map[key].push(config);
                }
            },
            get: function(key, filter) {
                var results = [];

                var res = filter("test", "test");

                if (!map.hasOwnProperty(key)) {
                    return results;
                }

                if (typeof filter === 'function') {
                    return $.grep(map[key], filter);
                }

                return map[key];
            }
        };
    };

    var registry = new Registry();

    CUI.TreeBrowser = new Class(/** @lends CUI.TreeBrowser# */{
        toString: 'TreeBrowser',
        extend: CUI.Widget,

        // Public API //

        /**
         @extends CUI.Widget
         @classdesc An autocompletable path browser widget

         <p>
         <select data-init="treebrowser" data-placeholder="Select path">
         <option>/apps</option>
         <option>/content</option>
         <option>/etc</option>
         <option>/libs</option>
         <option>/tmp</option>
         <option>/var</option>
         </select>
         </p>

         @desc Creates a path browser field
         @constructs

         @param {Object}   options                                    Component options
         @param {Array}    [options.options=empty array]              Array of available options (will be read from &lt;select&gt; by default)
         @param {Array}    [options.optionDisplayStrings=empty array] Array of alternate strings for display (will be read from &lt;select&gt; by default)
         @param {Mixed}    [options.optionLoader=use options]         (Optional) Callback to reload options list. Can be synch or asynch. In case of asynch handling, use second parameter as callback function: optionLoader(string currentPath, function callback) with callback(array resultArray)
         If type String, the function is looked up in the CUI.TreeBrowser registry. See {@link CUI.TreeBrowser.register} for details.
         Type String is necessary when using the data API (no Function-as-string support).
         @param {String}   [options.optionLoaderRoot=use options]     (Optional) Nested key to use as root to retrieve options from the option loader result
         @param {Mixed}    [options.optionValueReader=use options]    (Optional) Custom function to call to retrieve the value from the option loader result
         If type String, the function is looked up in the CUI.TreeBrowser registry. See {@link CUI.TreeBrowser.register} for details.
         type String is necessary when using the data API (no Function-as-string support).
         @param {Mixed}    [options.optionTitleReader=use options]    (Optional) Custom function to call to retrieve the title from the option loader result.
         If type String, the function is looked up in the CUI.TreeBrowser registry. See {@link CUI.TreeBrowser.register} for details.
         type String is necessary when using the data API (no Function-as-string support).
         @param {Boolean}  [options.showTitles=true]                  Should option titles be shown?
         @param {String}   [options.rootPath='/content']              The root path where completion and browsing starts.
         Use the empty string for the repository root (defaults to '/content').
         @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
         @param {Number}   [options.delay=200]                        Delay before starting autocomplete when typing
         @param {Number}   [options.disabled=false]                   Is this component disabled?
         @param {String}   [options.name=null]                        (Optional) name for an underlying form field.
         @param {Mixed}    [options.autocompleteCallback=use options] Callback for autocompletion.
         If type String, the function is looked up in the CUI.TreeBrowser registry. See {@link CUI.TreeBrowser.register} for details.
         type String is necessary when using the data API (no Function-as-string support).
         @param {Mixed}    [options.optionRenderer=default renderer]  (Optional) Renderer for the autocompleter and the tag badges.
         If type String, the function is looked up in the CUI.TreeBrowser registry. See {@link CUI.TreeBrowser.register} for details.
         type String is necessary when using the data API (no Function-as-string support).
         @param {String}   [options.position="below"]                 Where to position the dropdown list. "above" or "below"
         @param {Boolean}  [options.autoPosition=true]                Should the dropdown auto position itself if there's not enough space for the default position in the window?
         @param {String}   [options.pickerSrc]                        (Optional) The src from which to load the CUI.ColumnView, in the TreePicker UI.
         @param {String}   [options.pickerTitle="Select path"]        (Optional) The title of the CUI.Modal, in the TreePicker UI.
         @param {String}   [options.pickerValueKey="value"]           (Optional) The data key to use for reading path values from CUI.ColumnView selections.
         @param {String}   [options.pickerIdKey="id"]                 (Optional) The data key to use for navigating CUI.ColumnView path items from path tokens.
         @param {Mixed}    [options.crumbRoot="Content"]              (Optional) String, Object or jQuery to use as configuration for root crumb, in the TreePicker UI.
         String sets link text. Object allows for provision of title, icon, isAvailable and isNavigable properties.
         @param {Boolean}   [options.pickerMultiselect=false]         (Optional) Enable multiselect on the column view of the picker. This requires attaching own event listeners to the path browser to receive the
         list of selections outside of the path browser.
         */
        construct: function(options) {
            var opt, defaultHandler, config;
            var regOpts = [ 'optionLoader', 'optionValueReader', 'optionTitleReader','optionBreadcrumbReader', 'autocompleteCallback', 'optionRenderer' ];
            this.guid = treebrowser_guid += 1;

            // Read functions from registry for all registry-based options
            for (var i = 0; i < regOpts.length; i++) {
                opt = this.options[regOpts[i]];
                defaultHandler = this._getHandler(regOpts[i], 'cui.treebrowser.' + regOpts[i].toLowerCase() + '.default');

                if (typeof opt === 'function') {
                    this[regOpts[i]] = opt.bind(this); // Use the option as provided, if it is a function.
                } else if (typeof opt === 'string') {
                    config = this._getHandler(regOpts[i], opt); // Otherwise, lookup the name against the option in the registry.
                    this[regOpts[i]] = (config) ? config :
                        (defaultHandler) ? defaultHandler : $.noop();
                } else if (defaultHandler) {
                    this[regOpts[i]] = defaultHandler; // Finally, take a default if it is provided.
                }
            }

            // Adjust DOM to our needs
            this._render();

            // Populate alternative display strings if necessary
            while (this.options.optionDisplayStrings.length < this.options.options.length) {
                this.options.optionDisplayStrings.push(this.options.options[this.options.optionDisplayStrings.length]);
            }

            this._selectlist = this.$element.find('.coral-SelectList');
            if (this._selectlist.length === 0) {
                this._selectlist = $('<ul/>', {
                    'id': CUI.util.getNextId(),
                    'class': 'coral-SelectList'
                }).appendTo(this.$element);
            } else if (!this._selectlist.attr('id')) {
                this._selectlist.attr('id', CUI.util.getNextId());
            }

            // Define input element as owner of select list; aids keyboard accessibility
            this.inputElement.attr('aria-owns', this._selectlist.attr('id'));

            this.dropdownList = new CUI.SelectList({
                element: this._selectlist,
                relatedElement: $(this.inputElement).parent(),
                autofocus: false,
                autohide: true
            });

            // TreePicker
            this.$button = this.$element.find("."+CLASS_BUTTON);
            this.pickerEnabled = this.$button.length !== 0 && this.options.pickerSrc;

            if (this.pickerEnabled) {
                this._constructTreePicker();
            }

            // Listen to property changes
            this.$element.on('change:disabled', this._update.bind(this));
            this.$element.on('change:placeholder', this._update.bind(this));
            this.$element.on('change:options', this._changeOptions.bind(this));

            // Listen to events
            this.$element.on("input", "."+CLASS_INPUT, function() {
                if (this.options.disabled) {
                    return;
                }
                if (this.typeTimeout) {
                    clearTimeout(this.typeTimeout);
                }
                this.typeTimeout = setTimeout(this._inputChanged.bind(this), this.options.delay);
            }.bind(this));

            if (this.pickerEnabled) {
                this.$button.on("click", this._clickedTreePickerButton.bind(this));
                this.$picker.on("beforehide", this._beforeHideTreePicker.bind(this));
                this.$picker.on(PICKER_EVENT_CONFIRM, this._pickerSelectionConfirmed.bind(this));
            }

            this.$element.on("blur", "."+CLASS_INPUT, function() {
                if (this.options.disabled) {
                    return;
                }
                if (this.typeTimeout) {
                    clearTimeout(this.typeTimeout);
                }
                this.typeTimeout = null;
                // Set to existing selection for single term use
                if (this.selectedIndex >= 0) {
                    if (this.inputElement.val() === "") {
                        this.setSelectedIndex(-1);
                    } else {
                        this._update();
                    }
                }
            }.bind(this));

            this.$element.on("keydown", "input", this._keyPressed.bind(this));
            this.$element.on("keyup", "input", this._keyUp.bind(this));

            this.dropdownList.on("selected", function(event) {
                var page = {
                    title: event.displayedValue,
                    titlePath: "",
                    path : (event.selectedValue != null) ? event.selectedValue.toString() : null
                };
                var $pageList = this.$element.find('ul.coral-TagList.js-TreePickerField-tagList');
                _addItemToList(page, $pageList);
                this.$element.trigger( "TAGLIST_UPDATED",  this.$element );

                this.dropdownList.hide(200);
                this.inputElement.val('');

                this.inputElement.focus();
            }.bind(this));

            this.$element.on('click', ".coral-TagList-tag-removeButton", function(e) {
                var $tag = $(e.target).closest(".coral-TagList-tag");
                $('li.coral-TagList-tag > input[value="' + $tag.children('input').val() + '"]').parent().remove();

                this.$element.trigger( "TAGLIST_ITEM_REMOVED" , $tag);
                this.$element.trigger( "TAGLIST_UPDATED",  this.$element );
            }.bind(this));

            this.$element.on('TAGLIST_UPDATED', function(e) {
                this._updateTreePicker();
                this.$element.trigger("change:value");
            }.bind(this));
        },

        defaults: {
            autocompleteCallback: $.noop(),
            options: [],
            optionDisplayStrings: [],
            optionBreadcrumbStrings: [],
            optionLoader: $.noop(),
            optionLoaderRoot: null,
            optionValueReader: $.noop(),
            optionTitleReader: $.noop(),
            optionBreadcrumbReader: $.noop(),
            showTitles: true,
            rootPath: "/content",
            delay: 200,
            placeholder: null,
            optionRenderer: $.noop(),
            position: "below",
            autoPosition: true,
            pickerSrc: null,
            pickerTitle: "Select path",
            pickerValueKey: "value",
            pickerIdKey: "id"
        },

        dropdownList: null, // Reference to instance of CUI.DropdownList
        inputElement: null,
        typeTimeout: null,
        selectedIndex: -1,
        triggeredBackspace: false,

        /**
         * @param {Number} index Sets the currently selected option by its index.
         *                    -1 removes any selected index.
         */
        setSelectedIndex: function(index) {
            if (index < -1 || index >= this.options.options.length) {
                return;
            }
            this.selectedIndex = index;
            this._update();
        },

        /**
         * @return {Number} The currently selected options by index or -1 if none is selected
         */
        getSelectedIndex: function() {
            return this.selectedIndex;
        },

        // Internals //

        _changeOptions: function(event) {
            if (event.widget !== this) {
                return;
            }
            this.selectedIndex = -1;
            this._update();
        },

        /** @ignore */
        _render: function() {
            this._readDataFromMarkup();

            // If there was an select in markup: use it for generating options
            if (this.$element.find("select option").length > 0 && this.options.options.length === 0) {
                this.options.options = [];
                this.options.optionDisplayStrings = [];
                this.options.optionBreadcrumbStrings = [];
                this.$element.find("select option").each(function(i, e) {
                    this.options.options.push($(e).val());
                    this.options.optionDisplayStrings.push($.trim($(e).text()));
                    this.options.optionBreadcrumbStrings.push($.trim($(e).text()));

                    // Save selected state
                    if ($(e).attr("selected")) {
                        this.selectedIndex = i;
                    }

                }.bind(this));
            }

            this.inputElement = this.$element.find("."+CLASS_INPUT);

            this.$element.removeClass(CLASS_HIGHLIGHTED);

            if (!this.options.placeholder) {
                this.options.placeholder = this.inputElement.attr("placeholder");
            }

            this._update();
        },

        /** @ignore */
        _readDataFromMarkup: function() {
            var defaultHandler, config;
            var attrToKeyMap = [
                { attr: 'data-option-loader',         key: 'optionLoader' },
                { attr: 'data-option-value-reader',   key: 'optionValueReader' },
                { attr: 'data-option-title-reader',   key: 'optionTitleReader' },
                { attr: 'data-option-breadcrumb-reader',   key: 'optionBreadcrumbReader' },
                { attr: 'data-autocomplete-callback', key: 'autocompleteCallback' },
                { attr: 'data-option-renderer',       key: 'optionRenderer' }
            ];

            for (var i = 0; i < attrToKeyMap.length; i++) {
                if (this.$element.attr(attrToKeyMap[i].attr)) {
                    defaultHandler = this._getHandler(attrToKeyMap[i].key, 'cui.treebrowser.' + attrToKeyMap[i].key.toLowerCase() + '.default');
                    config = this._getHandler(attrToKeyMap[i].key, this.$element.attr(attrToKeyMap[i].attr));
                    this[attrToKeyMap[i].key] = (config) ? config :
                        (defaultHandler) ? defaultHandler : $.noop();
                }
            }

            if (this.$element.attr("data-option-loader-root")) {
                this.options.optionLoaderRoot = this.$element.attr("data-option-loader-root");
            }

            if (this.$element.attr("data-root-path")) {
                this.options.rootPath = this.$element.attr("data-root-path");
            }

            if (this.$element.attr("placeholder")) {
                this.options.placeholder = this.$element.attr("placeholder");
            }

            if (this.$element.attr("data-placeholder")) {
                this.options.placeholder = this.$element.attr("data-placeholder");
            }

            if (this.$element.attr("disabled") || this.$element.attr("data-disabled")) {
                this.options.disabled = true;
            }
        },

        /** @ignore */
        _update: function() {
            if (this.options.placeholder) {
                this.inputElement.attr("placeholder", this.options.placeholder);
            }

            if (this.options.disabled) {
                this.$element.addClass(CLASS_DISABLED);
                this.inputElement.add(this.$button).prop("disabled", true);
            } else {
                this.$element.removeClass(CLASS_DISABLED);
                this.inputElement.add(this.$button).removeProp("disabled");
            }

            if (this.selectedIndex >= 0) {
                // Value to set is what is currently in the input field until the last slash + the option value
                var option = this.options.options[this.selectedIndex];
                if (option && option.indexOf(PATH_SEPARATOR) !== 0) {
                    // Option contains a relative path
                    var parentPath = "";
                    var iLastSlash = this.inputElement.val().lastIndexOf(PATH_SEPARATOR);
                    if (iLastSlash >= 0) {
                        parentPath = this.inputElement.val().substring(0, iLastSlash + 1);
                    }
                    option = parentPath + option;
                }
                this._setInputValue(option, true);
            }
        },

        /** @ignore */
        _updateTreePicker: function() {
            this.$picker.find('input[type="checkbox"]').each(function (index, element) {
				$(element).prop('checked', false).prop('indeterminate', false);
            });
            this.$element.find('.js-TreePickerField-tagList input').each(function (index, element) {
                var $cb = $('input.coral-Checkbox-input[type="checkbox"][value="' + $(element).val() + '"]'),
                    $parent = $cb.closest('li'),
                    $parentUL = $parent.closest('ul.foundation-nestedcheckboxlist');
                $cb.prop("checked", true);
                $parent.children('ul').find('input.coral-Checkbox-input[type="checkbox"]').each(function(idx, elem) {
                    if ($(elem).prop('indeterminate') === false && $(elem).prop('checked') === false) {
                        $(elem).prop('checked', true);
                    }
                });
                if ($parentUL.length > 0) {
                    this._handleParent( $parent.closest('ul.foundation-nestedcheckboxlist') );
                }

            }.bind(this));
        },

        /** @ignore */
        _handleParent: function($elem) {
            var $sibling = $elem.siblings('div.coral-Form-fieldwrapper'),
                $cb = $sibling.find('input.coral-Checkbox-input[type="checkbox"]'),
                $parentUL = $cb.closest('ul.foundation-nestedcheckboxlist');
            if ($cb) {
                if ($cb.prop('indeterminate') === false && $cb.prop('checked') === false ) {
                    $cb.prop('indeterminate', true);
                }
                if ( $cb.prop('disabled') ) {
                    $cb.prop('indeterminate', false);
                    $cb.prop('checked', false);
                }
            }
            if ($parentUL.length > 0) {
                this._handleParent( $parentUL );
            }
        },

        /** @ignore */
        _setInputValue: function(newValue, moveCursor) {
            // Using select text util to select starting from last character to last character
            // This way, the cursor is placed at the end of the input text element
            if (newValue != null) {
                this.inputElement.val(newValue);
                this.inputElement.change();
                //IE11 fix is.(":focus") triggers blur event. Replaced by this.inputElement == document.activeElement
                if (moveCursor && this.inputElement == document.activeElement) {
                    CUI.util.selectText(this.inputElement, newValue.length);
                }
            }
        },

        /** @ignore */
        _keyUp: function(event) {
            var key = event.keyCode;
            if (key === 8) {
                this.triggeredBackspace = false; // Release the key event
            }
        },

        /** @ignore */
        _keyPressed: function(event) {
            var key = event.keyCode;
            if (!this.dropdownList.get('visible')) {
                //if (!this.dropdownList.isVisible()) {
                if (key === 40) {
                    this._inputChanged(); // Show box now!
                    event.preventDefault();
                }
            }
        },

        /** @ignore */
        _inputChanged: function() {
            var self = this;

            var searchFor = this.inputElement.val();
            if (searchFor.length > 0) {
                this.autocompleteCallback(searchFor)
                    .done(
                    function(results) {
                        self._showAutocompleter(results);
                    }
                )
                    .fail(
                    function() {
                        // TODO: implement
                    }
                )
                ;
            } else {
                this.dropdownList.hide();
            }
        },

        /** @ignore */
        _showAutocompleter: function(results) {
            this.dropdownList.hide();

            if ((!results) || results.length === 0) {
                return;
            }

            this._selectlist.empty();

            for (var i=0; i < results.length; i++) {
                this._selectlist.append((this.optionRenderer)(null, results[i]));
            }

            this.dropdownList.show();
        },

        /** @ignore */
        _rebuildOptions: function(def, path, object) {
            var self = this;

            var root = CUI.util.getNested(object, self.options.optionLoaderRoot);
            if (root) {
                var newOptions = [];
                var newOptionDisplayStrings = [];
                var newOptionBreadcrumbStrings = [];
                $.each(root, function(i, v) {
                    // Read the title and the value either from provided custom reader
                    // or using default expected object structure
                    var value;
                    if (self.optionValueReader) {
                        value = self.optionValueReader(v);
                    } else {
                        value = typeof v === "object" ? v.path : v;
                    }
                    newOptions.push(value);

                    var title = "";
                    if (self.optionTitleReader) {
                        title = self.optionTitleReader(v);
                    } else if (typeof v === "object") {
                        title = v.title;
                    }
                    newOptionDisplayStrings.push(title);

                    var titlePath = "";
                    if (self.optionBreadcrumbReader) {
                        titlePath = self.optionBreadcrumbReader(v);
                    } else if (typeof v === "object") {
                        titlePath = v.titlePath;
                    }
                    newOptionBreadcrumbStrings.push(titlePath);
                }.bind(self));

                self.options.options = newOptions;
                self.options.optionDisplayStrings = newOptionDisplayStrings;
                self.options.optionBreadcrumbStrings = newOptionBreadcrumbStrings;

                var filtered = self._filterOptions(path);
                def.resolve(filtered);
            } else {
                def.reject();
            }
        },

        /** @ignore */
        _filterOptions: function(searchFor) {
            var result = [];

            $.each(this.options.options, function(key, value) {
                result.push(key);
            }.bind(this));

            return result;
        },

        /** @ignore */
        _getHandler: function(key, name) {
            var filterFactory = function(comparator) {
                return function(item, index) {
                    return item.name === comparator;
                };
            };

            var a = filterFactory.call(this, name);
            var config = registry.get(key, a)[0];

            return (config && typeof config['handler'] === 'function') ? config.handler.bind(this) : undefined;
        },

        /** @ignore */
        _constructTreePicker: function () {
            // Create the TreePicker .coral-Modal, if not already existing in markup
            var id = "mod-tb-guid-" + this.guid,
                idSel = "#" + id + ".coral-Modal",
                pickerOptions;

            this.$picker = this.$element.find('.coral-Treepicker-picker.coral-Modal');
            this.$picker.attr("id", id);

            //Take rendered checklist and put into body so modal hide will work
            if (this.$picker.length === 1) {
                this.$picker.detach();
                $('body').append(this.$picker);
                this.$picker = $('body').find(idSel);
            }

            pickerOptions = $.extend({}, this.options, {'element': this.$picker, 'browser': this});
            this.picker = new TreePicker(pickerOptions);
        },

        /** @ignore */
        _clickedTreePickerButton: function () {
            var $wait;

            if (!this.options.disabled) {
                // The picker data hasn't loaded; display a loading indicator until resolution
                if (!this.picker.columnView) {
                    $wait = $(HTML_WAIT).appendTo('body');
                    this.picker.startup(this.inputElement.val()).always(function() {
                        $wait.remove();
                    });
                } else {
                    this.picker.startup(this.inputElement.val());
                }
            }
        },

        /** @ignore */
        _beforeHideTreePicker: function () {
            this.pickerShown = false;
            this.inputElement.removeClass(CLASS_HIGHLIGHTED);
        },

        /** @ignore */
        _pickerSelectionConfirmed: function (event) {
            var $pathBrowser = this.$element,
                selections = event.items,
                $itemList = $pathBrowser.find(".coral-TagList.js-TreePickerField-tagList");

            $itemList.empty();
            if (selections.length > 0) {
                $.each(selections, function() {
                    var selectedElem = this.item;
                    var $itemList = $pathBrowser.find(".coral-TagList.js-TreePickerField-tagList"),
                        page = {
                            title: $(selectedElem).parent().find('span.coral-Checkbox-description').html(),
                            titlePath: "",
                            path : selectedElem.val()
                        };
                    _addItemToList(page, $itemList);
                });
                this.$element.trigger( "TAGLIST_UPDATED", this.$element );
                $(".coral-ColumnView-item.is-active.is-selected", $(this)).toggleClass('is-active is-selected');
            } else {
                this.$element.trigger('TAGLIST_UPDATED', this.$element);
            }
            $pathBrowser.find('input.js-coral-treebrowser-input').val('');
        }
    });

    /** @ignore */
    function _addItemToList(page, $itemList) {
        var fieldName = $itemList.data("fieldname"),
            exists = false;
        if ($itemList.parent().data("pickerMultiselect")) {
            $itemList.find("input[name='" + fieldName + "']").each(function (idx, elem) {
                if ($(elem).val() === page.path) {
                    exists = true;
                }
            });
        } else {
            $itemList.empty();
        }
        if (!exists) {
            var $listItem = $('<li class="coral-TagList-tag coral-TagList-tag--multiline"/>').attr('title', page.title)
                .append($('<button class="coral-MinimalButton coral-TagList-tag-removeButton" type="button"/>').attr('title', Granite.I18n.get("Remove"))
                    .append($('<i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"/>')))
                .append($('<span class="coral-TagList-tag-label">').text(page.title))
                .append($('<br>'))
                .append($('<span class="coral-TagList-tag-label">').text(page.path));
            $listItem.append($('<input type="hidden" name="' + fieldName + '" value="' + page.path + '">'));
            $itemList.append($listItem);
            var parentDiv = $itemList.parent();
            parentDiv.trigger( "TAGLIST_ITEM_ADDED" ,page);
        }
    };

    var PICKER_CLASS_CONFIRM = 'js-coral-treebrowser-confirm',
        PICKER_CLASS_CANCEL = 'js-coral-treebrowser-cancel',
        PICKER_CLASS_MODAL_BACKDROP = 'coral-Treebrowser-picker-backdrop',
        PICKER_CLASS_MODAL_TITLE = 'coral-Modal-title',
        PICKER_CLASS_COLUMNVIEW_ITEM = 'coral-ColumnView-item',

        PICKER_EVENT_CONFIRM = 'coral-treebrowser-picker-confirm';

    var TreePicker = new Class(/** @lends TreePicker# */{
        toString: 'TreePicker',
        extend: CUI.Widget,

        // Public API //

        /**
         * @extends CUI.Widget
         * @classdesc Widget that handles creation and interaction with the CUI.TreeBrowser TreePicker UI.
         *
         * @constructs
         * @param {Object} options
         */
        construct: function (options) {
            // Init CUI.Modal
            this.$element.modal({visible: false});
            this.modal = this.$element.data("modal");

            // Add class to manage layering above other modals (from which the picker may be launched)
            this.modal.backdrop.addClass(PICKER_CLASS_MODAL_BACKDROP);

            // Find elements
            this.$cancel = this.$element.find('.'+PICKER_CLASS_CANCEL);
            this.$confirm = this.$element.find('.'+PICKER_CLASS_CONFIRM);

            this.browser = options.browser;

            // Event listening
            this._setupListeners();
        },

        /**
         Public to CUI.TreeBrowser
         Begins a path-picking session
         @param {String} path The path to initialize at
         @returns {jQuery.Deferred} a promise that will be accepted when picker has loaded, or rejected if the data fails to load
         */
        startup: function (path) {
            path = path || "";
            var deferred = $.Deferred(), cv, self = this,
                onDataLoaded = function() {
                    //self._renderTreePicker();
                    self._showTreePicker();
                };

            // We haven't loaded initial src data, setup the CUI.ColumnView.
            onDataLoaded();
            this.updateTreeBrowser();
            deferred.resolve()

            // Confirm action on Enter press if we have a valid selection.
            $(document).on('keypress.treebrowser-confirm', function (event) {
                if (event.which === 13) { // Enter
                    // Just take down, if the cancel button has focus
                    if ($(':focus').is(this.$cancel)) {
                        this._takeDown();
                    } else if (!this.$confirm.prop('disabled')) {
                        this._selectionConfirmed();
                    }
                }
            }.bind(this));

            return deferred.promise();
        },

        updateTreeBrowser: function(startingElem) {
            var sublist = startingElem ? startingElem : this.modal.$element.find('ul.foundation-nestedcheckboxlist').children('li.foundation-nestedcheckboxlist-item');

            $(sublist).find('input[type="checkbox"]').each(function(idx, elem) {
                var indeterminate = false,
                    checked = false,
                    parent = $(elem).closest('ul.foundation-nestedcheckboxlist').closest('li.foundation-nestedcheckboxlist-item'),
                    parentCB = parent.children('div').find('label input[type="checkbox"]'),
                    matches = $('[name="' + this.$element.data('fieldname') + '"][value="' + $(elem).val() + '"]');

                if (matches.length > 0) {
                    checked = true;
                } else {
                    matches = $('[name="' + this.$element.data('fieldname') + '"][value^="' + $(elem).val() + '"]');
                    if (matches.length > 0) {
                        indeterminate = true;
                    }
                }
                checked = checked || parentCB.prop('checked');

                $(elem).prop('indeterminate', indeterminate);
                $(elem).prop('checked', checked);
            }.bind(this));
            $('div.coral-Wait').remove();

            //$(this).toggleClass('closed');
        },

        // Internals //

        /** @ignore */
        _showTreePicker: function () {
            this.modal.show();
        },

        /** @ignore */
        _hideTreePicker: function () {
            this.modal.hide();
        },

        /** @ignore */
        _takeDown: function () {
            $('div.coral-Wait').remove();
            $(document).off('keypress.treebrowser-confirm');
            this._hideTreePicker();
        },

        /** @ignore */
        _controlChild: function(e) {
            var li = $(e.target).closest('li.foundation-nestedcheckboxlist-item'),
                path = $(e.target).parent().find('input:not([type="hidden"])').val(),
                data = { path : path },
                url = "/apps/treepicker/gui/treepicker.html",
                $wait = $(HTML_WAIT).appendTo('body'),
                $ul = $(e.target).parent().siblings('ul');

            if ($ul.children().length !== 0) {
                $(e.target).toggleClass('closed');
                $(e.target).parent().siblings('ul').toggle();
            } else {
                $.ajax({
                    context: {'picker': this, 'li': li, span: e.target},
                    data: data,
                    url: url
                }).done(function (data) {
                    var li = this.li,
                        sublist = li.find('ul.foundation-nestedcheckboxlist'),
                        fieldName = $(this).closest('.coral-Treepicker-picker').data('fieldname');
                    sublist.replaceWith(data);
                    $(this.span).toggleClass('closed', false);
                    this.picker.updateTreeBrowser(li);
                });
            }
        },

        /** @ignore */
        _setupListeners: function () {
            this.$cancel.on('click', this._takeDown.bind(this));
            this.$confirm.on('click', this._selectionConfirmed.bind(this));
            //this.$columnView.on(PICKER_EVENT_COLUMNVIEW_ITEM_SELECT, this._itemSelected.bind(this));

            this.modal.$element.on('click', 'li.foundation-nestedcheckboxlist-item span.collapse-control', function(e) {
                this._controlChild(e);
            }.bind(this));
        },

        /** @ignore */
        _selectionConfirmed: function() {
            //var items = this.columnView.getSelectedItems(), v;

            var items = [],
                rawCheckedItems = this.$element.find(':checked'),
                $wait = $(HTML_WAIT).appendTo('body');;

            rawCheckedItems.each(function(i, item) {
                var $item = $(item),
                    $parent = $item.closest('li'),
                    $parentCB = $parent.parent().siblings('div.coral-Form-fieldwrapper').find('input.coral-Checkbox-input[type="checkbox"]');
                if (!$parentCB.prop('checked')) {
                    items.push({
                        'checked': $item.hasClass('is-selected'),
                        'data': $item.data('data'),
                        'item': $item
                    });
                }
            });

            if (items.length > 0) {
                // Single selection only
                if (items[0].data && items[0].data[this.options.pickerValueKey]) {
                    v = items[0].data[this.options.pickerValueKey]; // Read value from data object
                } else if (items[0].item) {
                    v = items[0].item.data(this.options.pickerValueKey); // Otherwise, try attribute
                }

                this.$element.trigger($.Event(PICKER_EVENT_CONFIRM, { "selectedValue": v , "items": items}));
            } else {
                // No items selected, take the root path
                this.$element.trigger($.Event(PICKER_EVENT_CONFIRM, { "selectedValue": null, "items": items }));
            }

            this._takeDown();
        }
    });



    CUI.util.plugClass(CUI.TreeBrowser);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on("cui-contentloaded.data-api", function(e) {
            $("[data-init~='treebrowser']", e.target).treeBrowser();
        });
    }

    /**
     Registers an option handler.

     Example handler config:
     var myHandlerConfig = {
         name: "cui.treebrowser.optionrenderer.myoptionrenderer"
         handler: function(param1, param2, ...) {
          // The option handler
         }
       }

     Example usage:
     CUI.TreeBrowser.register("optionRenderer", myHandlerConfig);

     @param {String} key The option to register the handler for against.
     @param {Object} config The handler configuration (name and handler function).

     @static
     */
    CUI.TreeBrowser.register = function(key, config) {
        registry.register(key, config);
    };

    CUI.TreeBrowser.register('optionLoader', {
        name: 'cui.treebrowser.optionloader.default',
        handler: function(searchFor, callback) {
            var qStr = "/bin/querybuilder.json";
            jQuery.get( qStr,
                {
                    path: 				this.$element.data("basepath"),
                    property: 			"jcr:content/jcr:title",
                    "property.operation": "like",
                    "property.value": 	searchFor + "%",
                    type:				"cq:Page",
                    "p.limit":			20,
                    orderby:			"@jcr:content/jcr:title",
                    "orderby.sort":		"asc"
                },
                function(data) {
                    var pages = data.hits;
                    var result = [];
                    for(var p in pages) {
                        if (pages[p]['path'] !== undefined) {
                            result.push(pages[p]);
                        }
                    }
                    if (callback) callback(result);
                }, "json");
            return false;
        }
    });

    CUI.TreeBrowser.register('optionValueReader', {
        name: 'cui.treebrowser.optionvaluereader.default',
        handler: function(value) {
            return value.path;
        }
    });

    CUI.TreeBrowser.register('optionTitleReader', {
        name: 'cui.treebrowser.optiontitlereader.default',
        handler: function(value) {
            return value.title;
        }
    });

    CUI.TreeBrowser.register('optionRenderer', {
        name: 'cui.treebrowser.optionrenderer.default',
        handler: function(iterator, index) {
            var value = this.options.options[index];

            // Use alternate display strings if possible
            var titleMarkup = '', titlePath = '';
            if (this.options.showTitles && this.options.optionDisplayStrings[index] && this.options.optionDisplayStrings[index].length > 0) {
                titleMarkup = ' ' + this.options.optionDisplayStrings[index];
            }

            if (this.options.showTitles && this.options.optionBreadcrumbStrings[index] && this.options.optionBreadcrumbStrings[index].length > 0) {
                titlePath = ' ' + this.options.optionBreadcrumbStrings[index];
            }

            return $('<li class="coral-SelectList-item coral-SelectList-item--option" data-value="'+ value +'">' + titleMarkup +'<br>'+ titlePath +'</li>');
        }
    });

    CUI.TreeBrowser.register('optionRenderer', {
        name: 'cui.treebrowser.optionrenderer.nobreadcrumb',
        handler: function(iterator, index) {
            var value = this.options.options[index];

            // Use alternate display strings if possible
            var titleMarkup = '';
            if (this.options.showTitles && this.options.optionDisplayStrings[index] && this.options.optionDisplayStrings[index].length > 0) {
                titleMarkup = ' ' + this.options.optionDisplayStrings[index];
            }

            return $('<li class="coral-SelectList-item coral-SelectList-item--option" data-value="'+ value +'">' + titleMarkup  +'</li>');
        }
    });

    CUI.TreeBrowser.register('autocompleteCallback', {
        name: 'cui.treebrowser.autocompletecallback.default',
        handler: function(path) {
            var self = this;
            var def = $.Deferred();

            // Make the option loader a promise to guarantee that the callback is
            // executed at the right rime
            var loader = {
                loadOptions: self.optionLoader
            };
            var loaderDef = $.Deferred();
            loaderDef.promise(loader);
            loader.done(
                function(object) {
                    if ($.isFunction(object.promise)) {
                        // Original function was already returning a promise
                        // Bind the rebuild options on that object's 'done' method
                        object.done(
                            function(object) {
                                self._rebuildOptions(def, path, object);
                            }
                        );
                    } else {
                        // Original function was not returning a promise
                        self._rebuildOptions(def, path, object);
                    }
                }
            );

            // Asynch optionLoader
            var results = loader.loadOptions(path, function(data) {
                loaderDef.resolve(data);
            });

            //  Synch optionLoader
            if (results) loaderDef.resolve(results);

            return def.promise();
        }
    });

}(window.jQuery));