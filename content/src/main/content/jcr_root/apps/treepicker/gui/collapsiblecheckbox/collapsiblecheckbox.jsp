<%--
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
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
          import="java.util.Arrays,
                  java.util.List,
                  com.adobe.granite.ui.components.AttrBuilder,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Field,
                  com.adobe.granite.ui.components.Tag" %><%--###
Checkbox
========

.. granite:servercomponent:: /libs/granite/ui/components/foundation/form/checkbox
   :supertype: /libs/granite/ui/components/foundation/form/field

   A checkbox component.
   
   It extends :granite:servercomponent:`Field </libs/granite/ui/components/foundation/form/field>` component.

   It has the following content structure:

   .. gnd:gnd::

      [granite:FormCheckbox]
      
      /**
       * The id attribute.
       */
      - id (String)

      /**
       * The class attribute. This is used to indicate the semantic relationship of the component similar to ``rel`` attribute.
       */
      - rel (String)

      /**
       * The class attribute.
       */
      - class (String)

      /**
       * The title attribute.
       */
      - title (String) i18n
      
      /**
       * The name that identifies the field when submitting the form.
       */
      - name (String)
      
      /**
       * ``true`` to generate the `SlingPostServlet @Delete <http://sling.apache.org/documentation/bundles/manipulating-content-the-slingpostservlet-servlets-post.html#delete>`_ hidden input based on the name.
       */
      - deleteHint (Boolean) = true

      /**
       * The value of the field.
       */
      - value (String)

      /**
       * Indicates if the field is in disabled state.
       */
      - disabled (Boolean)

      /**
       * Indicates if the checkbox is checked.
       * Providing ``checked`` property (either ``true`` or ``false``) will imply ``ignoreData`` to be ``true``.
       */
      - checked (Boolean)

      /**
       * If ``false``, the checked status is based on matching the form values by ``name`` and ``value`` properties.
       * Otherwise, the form values are not matched, and the checked status is based on ``checked`` property specified.
       */
      - ignoreData (Boolean)
      
      /**
       * The text of the checkbox.
       */
      - text (String) i18n
      
      /**
       * ``true`` to automatically submit the form when the checkbox is checked/unchecked.
       *
       * Pressing "enter" in the text field will submit the form (when everything is configured properly). This is the equivalence of that for checkbox.
       */
      - autosubmit (Boolean)
      
      /**
       * The description of the component.
       */
      - fieldDescription (String) i18n

      /**
       * Renders the read-only markup as well.
       */
      - renderReadOnly (Boolean)
###--%><%

    Config cfg = cmp.getConfig();
    
    Tag tag = cmp.consumeTag();
    AttrBuilder attrs = tag.getAttrs();

    String name = cfg.get("name", String.class);
    String value = cfg.get("value", String.class);
    boolean disabled = cfg.get("disabled", false);
    String text = cfg.get("text", String.class);
    boolean hasChildren = cfg.get("hasChildren", false);
    String fieldDesc = cfg.get("fieldDescription", String.class);

    attrs.add("id", cfg.get("id", String.class));
    attrs.addClass(cfg.get("class", String.class));
    attrs.addRel(cfg.get("rel", String.class));
    attrs.add("title", i18n.getVar(cfg.get("title", String.class)));
    
    attrs.add("type", "checkbox");
    attrs.add("name", name);
    attrs.add("value", value);
    attrs.addDisabled(disabled);
    
    if (cfg.get("autosubmit", false)) {
        attrs.addClass("foundation-field-autosubmit");
    }

    boolean checked = false;
    boolean renderReadOnlyUnchecked = cfg.get("renderReadOnlyUnchecked", false);
    String rootClass = "";
    
    if (cfg.get("checked", Boolean.class) != null || cfg.get("partial", Boolean.class) != null) {
        // providing "checked" or "partial" in configuration results in ignoring content data
        boolean partial = cfg.get("partial", false);
        checked = cfg.get("checked", false);
        rootClass = Field.getRootClass(cfg, !checked && !partial && !renderReadOnlyUnchecked);

        attrs.addChecked(checked);

        if (partial) {
            attrs.add("aria-checked", "mixed");
        }
    } else if (!cfg.get("ignoreData", false)) {
        // mark checked if content value equals config value

        // TODO Currently this component uses strings to distinguish between checked and non-checked status, which seems
        // to be more compatible to old releases. But it would be more straightforward to use boolean values.

        List<String> values = Arrays.asList(cmp.getValue().get(name, new String[0]));

        checked = values.contains(value);
        rootClass = Field.getRootClass(cfg, !checked);

        attrs.addChecked(checked);
    }

    attrs.addClass("coral-Checkbox-input");

    attrs.addOthers(cfg.getProperties(), "id", "class", "rel", "title", "name", "value", "text", "disabled", "checked", "partial", "fieldDescription", "renderReadOnly", "renderReadOnlyUnchecked", "ignoreData");

    AttrBuilder checkboxfieldAttrs = new AttrBuilder(request, xssAPI);
    checkboxfieldAttrs.addClass("coral-Checkbox");
    
    AttrBuilder deleteAttrs = new AttrBuilder(request, xssAPI);
    deleteAttrs.add("type", "hidden");
    deleteAttrs.addDisabled(disabled);
    if (name != null && name.trim().length() > 0) {
        deleteAttrs.add("name", name + "@Delete");
    }


    AttrBuilder divAttrs = new AttrBuilder(request, xssAPI);
    divAttrs.add("hasChildren", hasChildren);

    if (cfg.get("renderReadOnly", false)) {
        %><div class="foundation-field-editable <%= rootClass %>"><%
            AttrBuilder roAttrs = new AttrBuilder(request, xssAPI);
            roAttrs.addClass("foundation-field-readonly");
                
	        if (cmp.getOptions().rootField()) {
	            roAttrs.addClass("coral-Form-field");
	        }
	        
	        if (checked || renderReadOnlyUnchecked) {
                %><div <%= roAttrs.build() %>>
					<span class="control">-</span>
                    <label class="coral-Checkbox">
                        <input class="coral-Checkbox-input" type="checkbox" disabled
                               <% if (checked) { %> checked <% } %>
                        >
                        <span class="coral-Checkbox-checkmark"></span>
                        <span class="coral-Checkbox-description"><%= outVar(xssAPI, i18n, text) %></span>
                    </label>
                </div><%
            }
        
	        if (cmp.getOptions().rootField()) {
	            checkboxfieldAttrs.addClass("coral-Form-field");
	            %><div class="foundation-field-edit"><%
	        } else {
	            checkboxfieldAttrs.addClass("foundation-field-edit");
	        }
	        
	        %><label <%= checkboxfieldAttrs.build() %>>
	            <input <%= attrs.build() %> />
	            <span class="coral-Checkbox-checkmark"></span>
	            <span class="coral-Checkbox-description"><%= outVar(xssAPI, i18n, text) %></span><%
	            
	            if (cfg.get("deleteHint", true)) {
                    %><input <%= deleteAttrs.build() %>><%
                }
	        %></label><%
	        
	        if (cmp.getOptions().rootField()) {
                %></div><%
            }
        %></div><%
    } else {
        if (cmp.getOptions().rootField()) {
            checkboxfieldAttrs.addClass("coral-Form-field");

            %><div class="coral-Form-fieldwrapper coral-Form-fieldwrapper--singleline" <%= divAttrs.build() %>><%
        }

        %><span class="collapse-control <% if (!hasChildren) { %>no-children<% } %> closed"></span>
            <label <%= checkboxfieldAttrs.build() %>>
            <input <%= attrs.build() %> />
            <span class="coral-Checkbox-checkmark"></span>
            <span class="coral-Checkbox-description"><%= outVar(xssAPI, i18n, text) %></span><%
            
            if (cfg.get("deleteHint", true)) {
                %><input <%= deleteAttrs.build() %>><%
            }
        %></label><%

        if (cmp.getOptions().rootField()) {
            if (fieldDesc != null) {
                %><span class="coral-Form-fieldinfo coral-Icon coral-Icon--infoCircle coral-Icon--sizeS" data-init="quicktip" data-quicktip-type="info" data-quicktip-arrow="left" data-quicktip-content="<%= outAttrVar(xssAPI, i18n, fieldDesc) %>"></span><%
            }
            %></div><%
        }
    }

%>