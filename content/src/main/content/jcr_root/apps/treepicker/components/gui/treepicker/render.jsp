<%--
  ADOBE CONFIDENTIAL

  Copyright 2013 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
--%><%
%><%@include file="/libs/granite/ui/global.jsp" %><%
%><%@page session="false"
          import="org.apache.jackrabbit.util.Text,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Field,
                  java.util.Set,
                  com.adobe.granite.ui.components.Tag,com.day.cq.wcm.api.Page,
                  org.apache.sling.api.resource.ValueMap,
				  com.adobe.granite.ui.components.ds.ValueMapResource, 
                  java.util.HashMap, 
                  org.apache.sling.api.wrappers.ValueMapDecorator" %>
<%

    Config cfg = cmp.getConfig();
    String name = cfg.get("name", "cq:paths");
    ValueMap vm = (ValueMap) request.getAttribute(Field.class.getName());

    Field field = new Field(cfg);
    boolean mixed = field.isMixed(cmp.getValue());

    boolean disabled = cfg.get("disabled", false);
    String predicate = cfg.get("predicate", "hierarchyNotFile"); // 'folder', 'hierarchy', 'hierarchyNotFile' or 'nosystem'
    String defaultOptionLoader = "granite.ui.pathBrowser.pages." + predicate;
    Tag tag = cmp.consumeTag();
    String rootPath = cmp.getExpressionHelper().getString(cfg.get("basePath", "/"));

    AttrBuilder attrs = tag.getAttrs();

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));

    attrs.addClass("coral-PathBrowser");
    attrs.addClass("cq-TreePickerField");
    attrs.add("data-init", "treebrowser");
    attrs.add("data-root-path", rootPath);
    attrs.add("data-option-loader", cfg.get("optionLoader", defaultOptionLoader));
    attrs.add("data-option-loader-root", cfg.get("optionLoaderRoot", String.class));
    attrs.add("data-option-value-reader", cfg.get("optionValueReader", String.class));
    attrs.add("data-option-title-reader", cfg.get("optionTitleReader", String.class));
    attrs.add("data-option-renderer", cfg.get("optionRenderer", String.class));
    attrs.add("data-autocomplete-callback", cfg.get("autocompleteCallback", String.class));

    if (disabled) {
        attrs.add("data-disabled", disabled);
    }

    String defaultPickerSrc = "/libs/wcm/core/content/common/pathbrowser/column.html" + Text.escapePath(rootPath) + "?predicate=" + Text.escape(predicate);
    String pickerSrc = cfg.get("pickerSrc", defaultPickerSrc);
    Resource rootResource = resourceResolver.getResource(rootPath);
    String crumbRoot = i18n.getVar("Home");
    if (rootResource != null) {
        crumbRoot = rootResource.getValueMap().get("jcr:title", rootResource.getName());
    }
    String icon = cfg.get("icon", "icon-folderSearch");
    attrs.add("data-required", cfg.get("required", false));

    attrs.add("data-picker-src", pickerSrc);
    attrs.add("data-picker-title", i18n.getVar(cfg.get("pickerTitle", String.class)));
    attrs.add("data-picker-value-key", cfg.get("pickerValueKey", String.class));
    attrs.add("data-picker-id-key", cfg.get("pickerIdKey", String.class));
    attrs.add("data-crumb-root", cfg.get("crumbRoot", crumbRoot));
    attrs.add("data-picker-multiselect", cfg.get("pickerMultiselect", false));

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "emptyText", "disabled", "rootPath", "optionLoader", "optionLoaderRoot", "optionValueReader", "optionTitleReader", "optionRenderer", "renderReadOnly", "fieldLabel", "fieldDescription", "required", "icon");

    AttrBuilder inputAttrs = new AttrBuilder(request, xssAPI);
    inputAttrs.addClass("coral-InputGroup-input coral-Textfield");
    inputAttrs.addClass("js-coral-pathbrowser-input");
    inputAttrs.addClass("js-coral-treebrowser-input");
    inputAttrs.add("type", "text");
    inputAttrs.add("placeholder", i18n.getVar(cfg.get("emptyText", String.class)));
    inputAttrs.add("autocomplete", "off");
    inputAttrs.addDisabled(disabled);

    if (mixed) {
        inputAttrs.addClass("foundation-field-mixed");
        //inputAttrs.add("placeholder", i18n.get("<Mixed Entries>"));
    } else {
        //inputAttrs.add("value", vm.get("value", String.class));
    }

    if (cfg.get("required", false)) {
        inputAttrs.add("aria-required", true);
    }

    AttrBuilder deleteAttrs = new AttrBuilder(request, xssAPI);
    deleteAttrs.add("type", "hidden");
    deleteAttrs.addDisabled(disabled);
    deleteAttrs.add("name", name + "@Delete");

    AttrBuilder typeHintAttrs = new AttrBuilder(request, xssAPI);
    typeHintAttrs.add("type", "hidden");
    typeHintAttrs.addDisabled(disabled);
    typeHintAttrs.add("name", name + "@TypeHint");
    typeHintAttrs.add("value", "String[]");

%><div <%= attrs.build() %>>
    <input <%= deleteAttrs.build() %>>
    <input <%= typeHintAttrs.build() %>>
    <div class="coral-Form-fieldwrapper">
        <span class="pathBrowser-selectList-holder">
            <span class="coral-InputGroup coral-InputGroup--block">
                <input <%= inputAttrs.build() %>>
                <span class="coral-InputGroup-button">
                    <button class="coral-Button coral-Button--square js-coral-treebrowser-button" type="button" title="<%= xssAPI.encodeForHTMLAttr(i18n.get("Browse")) %>">
                        <i class="coral-Icon coral-Icon--sizeS <%= cmp.getIconClass(icon) %>"></i>
                    </button>
                </span>
            </span>
        </span>
    </div>
    <%
        Set<Page> pages = (Set<Page>) request.getAttribute(Field.class.getName() + ".pages");

        AttrBuilder valuesAttrs = new AttrBuilder(request, xssAPI);
        valuesAttrs.addClass("coral-TagList js-TreePickerField-tagList");
        valuesAttrs.add("data-fieldname", name);

    %><ul <%= valuesAttrs.build() %>><%
    for (Page pg : pages) {
        AttrBuilder hiddenAttrs = new AttrBuilder(request, xssAPI);
        hiddenAttrs.add("type", "hidden");
        hiddenAttrs.add("data-foundation-uritemplate-parent", i18n.getVar(cfg.get("foundation-uritemplate-parent", String.class))); //Custom
        hiddenAttrs.add("name", name);
        hiddenAttrs.add("value", pg.getPath());
        String title = pg.getTitle();

%><li class="coral-TagList-tag coral-TagList-tag--multiline" title="<%= xssAPI.encodeForHTMLAttr(title) %>">
    <button class="coral-TagList-tag-removeButton coral-MinimalButton" title="<%= i18n.get("Remove") %>">
        <i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>
    </button>
    <span class="coral-TagList-tag-label"><%= xssAPI.encodeForHTML(title) %></span>
    <br />
    <span class="coral-TagList-tag-label"><%= xssAPI.encodeForHTML(pg.getPath()) %></span>
    <input <%= hiddenAttrs.build() %>>
</li><%
    }
%></ul>

    <%
        AttrBuilder modalAttrs = new AttrBuilder(request, xssAPI);
        modalAttrs.addClass("coral-Treepicker-picker coral-Modal");
        modalAttrs.add("data-picker-multiselect", cfg.get("pickerMultiselect", false));
        modalAttrs.add("data-fieldname", name);
    %>
    <div  <%= modalAttrs.build() %>>
        <div class="coral-Modal-header">
            <h2 class="coral-Modal-title coral-Heading coral-Heading--2"><%= cfg.get("pickerTitle", String.class) %></h2>
            <button type="button" class="js-coral-treebrowser-confirm coral-Button coral-Button--square coral-Button--primary" title="Confirm">
                <i class="coral-Icon coral-Icon-sizeXS coral-Icon--check"></i>
            </button>
            <button type="button" class="js-coral-treebrowser-cancel coral-Button coral-Button--square coral-Button" title="Cancel">
                <i class="coral-Icon coral-Icon-sizeXS coral-Icon--close"></i>
            </button>
        </div>
        <div class="coral-Modal-body">
            <%
                ValueMap nestedCheckBoxListProperties = new ValueMapDecorator(new HashMap<String, Object>());
                nestedCheckBoxListProperties.put("class", "foundation-nestedcheckboxlist");
                nestedCheckBoxListProperties.put("disconnected", cfg.get("disconnected", true));
                nestedCheckBoxListProperties.put("rootPath", rootPath);
                ValueMapResource nestedCheckBoxList = new ValueMapResource(resourceResolver, resource.getPath(), "granite/ui/components/foundation/form/nestedcheckboxlist", nestedCheckBoxListProperties);
            %>
            <sling:include resource="<%= nestedCheckBoxList %>" />
        </div>
    </div>
</div>