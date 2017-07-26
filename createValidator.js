/**
 * Created by tdzl2003 on 2017/7/22.
 */

const { shape } = require('./types');

module.exports = function createValidator(fields, type) {
  const validator = shape("", fields);

  const ret = (ctx, next) => {
    const values = ctx.request[type];
    const validated = validator(values, type);
    Object.defineProperty(ctx.request, type, {
      get: () => validated,
    });
    console.log(validated);
    return next();
  };

  ret.json = (json) => {
    json.validate = json.validate || {};
    json.validate[type] = validator.json();
  };

  ret.html = () => {
    return `<h4>${type}</h4>${validator.html()}`;
  };

  return ret;
}
