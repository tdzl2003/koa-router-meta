/**
 * Created by tdzl2003 on 2017/7/21.
 */
const Router = require('koa-router');

function optToJson({ method, path, comment, handlers, }){
  const ret = {
    method,
    path,
    comment,
  };
  for (const handler of handlers) {
    if (handler.json) {
      handler.json(ret);
    }
  }
  return ret;
}

function subrouteToJson({path, router}) {
  return {
    path,
  };
}

function _metaRoute() {
  return {
    childRoutes: this._childRoutes ? this._childRoutes.map(subrouteToJson) : [],
    requests: this._requests ? this._requests.map(optToJson) : [],
  };
}
Router.prototype.metaRoute = function() {
  return ctx => {
    ctx.body = _metaRoute.call(this);
  }
};

function renderBreadCrumb(path) {
  const piece = path.split('/');
  const last = piece.pop();
  return piece.map((v, i) => `<a href="${piece.slice(0, i).join('/')}/_doc.html">${v}/</a>
`).join('') + last + '/';
}

function renderSubRoute(currPath, {path}) {
  return `<p><a href="${currPath}${path}/_doc.html">${currPath}${path}</a></p>`;
}

function renderRequest(currPath, {method, path, comment, handlers}) {
  return `<div class="request"><h3>${method} ${currPath}${path}</h3>
<p>${comment || ''}</p>
${handlers.map(v => v.html ? v.html() : '').join('')}</div>`;
}

function _docHtmlRoute(ctx) {
  const currPath = ctx.request.url.replace(/\/[^\/]+$/, '');
  ctx.body =  `<html>
<head>
<title>${this.opts.title || ctx.app.title || 'Koa-Router-Meta'}</title>
<style>
table {
  width: 100%;
  border: solid 1px #666666;
}
tbody td {
  border-top: solid 1px #666666;
}
.request {
  border: solid 1px #666666;
  padding: 5px 20px;
}
</style>
</head>
<body>
  <h1>${renderBreadCrumb(currPath)}</h1>
  <h2>Sub Routes:</h2>
${this._childRoutes ? this._childRoutes.map(v => renderSubRoute(currPath, v)) : ''}
  <h2>Requests:</h2>
${this._requests ? this._requests.map(v => renderRequest(currPath, v)) : ''}
</body>
</html>
`;
}

Router.prototype.metaDocRoute = function() {
  return _docHtmlRoute.bind(this);
}
