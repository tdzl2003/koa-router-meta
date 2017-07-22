/**
 * Created by DengYun on 2017/7/21.
 */

const Router = require('koa-router');
const methods = require('methods');
const bodyParser = require('koa-bodyparser');
require('./docHtml');

const mockResponse = require('./mockResponse');
const createValidator = require('./createValidator');

Router.prototype._recordRequest = function (opts) {
  this._requests = this._requests || [];
  this._requests.push(opts);
};

Router.prototype._recordSubRoute = function (opts) {
  if (!opts.path) {
    return;
  }
  const router = opts.handlers.map(v=>v.router).find(v=>v);
  if (!router) {
    return;
  }
  this._childRoutes = this._childRoutes || [];
  this._childRoutes.push({
    path: opts.path,
    router,
  });
}

methods.forEach(method => {
  const origin = Router.prototype[method];

  const override = function (opts, ...extra) {
    if (typeof(opts) === 'string') {
      this._recordRequest({
        method: method.toUpperCase(),
        path: opts,
        handlers: extra,
      });
      return origin.call(this, opts, ...extra);
    }
    const { path, validate } = opts;
    const handlers = opts.handlers ? [...opts.handlers] : [];
    if (opts.mockResponse) {
      handlers.push(mockResponse(opts.mockResponse));
    }
    if (validate) {
      const { query, body, params } = validate;
      if (body) {
        handlers.unshift(createValidator(body, "body"));
        handlers.unshift(bodyParser());
      } else if (__DEV__) {
        handlers.unshift((ctx, next) => {
          ctx.request.body = null
          return next();
        });
      }
      if (query) {
        handlers.unshift(createValidator(query, "query"));
      } else if (__DEV__) {
        handlers.unshift((ctx, next) => {
          ctx.request.query = null
          return next();
        });
      }
      if (params) {
        handlers.unshift(createValidator(params, "params"));
      } else if (__DEV__) {
        handlers.unshift((ctx, next) => {
          ctx.request.params = null
          return next();
        });
      }
    }
    if (opts.handler) {
      handlers.push(opts.handler);
    }
    this._recordRequest(Object.assign({}, opts, {
      method: method.toUpperCase(),
      handlers,
    }));
    return origin.call(this, path, ...handlers);
  };
  override.origin = origin;

  Router.prototype[method] = override;
});

Router.prototype.request = function(opts) {
  if (Array.isArray(opts)) {
    for (const opt of opts) {
      this.request(opt);
    }
    return;
  }
  const { method } = opts;
  const lowerMethod = method.toLowerCase();
  if (methods.indexOf(lowerMethod) < 0) {
    throw new Error(`Invalid http method ${opts.method}`);
  }
  return this[lowerMethod](opts);
};

const originUse = Router.prototype.use;
Router.prototype.use = function(path, ...handlers) {
  if (typeof(path) === 'string') {
    this._recordSubRoute({path, handlers});
  }
  originUse.call(this, path, ...handlers);
};

Router.prototype.registerMetaRoute = function() {
  this.get.origin.call(this, '/_meta', this.metaRoute());
  this.get.origin.call(this, '/_doc.html', this.metaDocRoute());
};

Object.assign(exports, require('./types'));
exports.StatusError = require('./StatusError');
