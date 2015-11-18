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
          import="java.util.HashMap,
                  org.apache.sling.api.resource.ValueMap,
                  org.apache.sling.api.wrappers.ValueMapDecorator,
                  com.adobe.granite.ui.components.Config,
                  com.adobe.granite.ui.components.Field,
                  com.day.cq.wcm.api.Page,
                  com.day.cq.wcm.api.PageManager,
                  java.util.Set,
                  java.util.HashSet" %><%

    PageManager pm = resourceResolver.adaptTo(PageManager.class);

    Config cfg = cmp.getConfig();

    String name = cfg.get("name", String.class);
    String[] values = cmp.getValue().getContentValue(name, new String[0]);

    ValueMap vm = new ValueMapDecorator(new HashMap<String, Object>());
    vm.put("value", values);
    request.setAttribute(Field.class.getName(), vm);

    Set<Page> pages = new HashSet<Page>(values.length);
    for (String value : values) {
        Page pg = pm.getPage(value);
        if (pg != null) {
            pages.add(pg);
        }
    }
    request.setAttribute(Field.class.getName() + ".pages", pages);
%><ui:includeClientLib categories="freestyle-cms.gui.common.pathpicker" />
