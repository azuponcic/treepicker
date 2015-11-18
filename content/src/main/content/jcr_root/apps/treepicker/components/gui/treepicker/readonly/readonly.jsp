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
          import="com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.Tag,
                  com.day.cq.wcm.api.Page,
				  java.util.Set" %><%

    Config cfg = cmp.getConfig();
    String name = cfg.get("name", "cq:paths");


    boolean disabled = cfg.get("disabled", true);
    Tag tag = cmp.consumeTag();

    AttrBuilder attrs = tag.getAttrs();

    attrs.add("id", cfg.get("id", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));


    if (disabled) {
        attrs.add("data-disabled", disabled);
    }

    attrs.addOthers(cfg.getProperties(), "id", "rel", "title", "name", "value", "emptyText", "disabled", "renderReadOnly", "fieldLabel", "fieldDescription", "required", "icon");


%>
<div <%= attrs.build() %>>
    <label class="coral-Form-fieldlabel"><%= xssAPI.encodeForHTMLAttr(cfg.get("fieldLabel", String.class)) %></label>
    <%
        Set<Page> pages = (Set<Page>) request.getAttribute(Field.class.getName() + ".pages");

        AttrBuilder valuesAttrs = new AttrBuilder(request, xssAPI);
        valuesAttrs.addClass("coral-TagList js-TreePickerField-tagList");
        valuesAttrs.add("data-fieldname", name);

    %><ul <%= valuesAttrs.build() %>><%
    for (Page pg : pages) {
        AttrBuilder hiddenAttrs = new AttrBuilder(request, xssAPI);
        hiddenAttrs.add("type", "hidden");
        hiddenAttrs.add("name", name);
        hiddenAttrs.add("value", pg.getPath());
        String title = pg.getTitle();

%><li class="coral-TagList-tag coral-TagList-tag--multiline" title="<%= xssAPI.encodeForHTMLAttr(title) %>">
    <span class="coral-TagList-tag-label"><%= xssAPI.encodeForHTML(title) %></span>
    <br />
    <span class="coral-TagList-tag-label"><%= xssAPI.encodeForHTML(pg.getPath()) %></span>
</li><%
    }
%></ul>
</div>