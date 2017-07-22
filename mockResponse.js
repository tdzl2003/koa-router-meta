/**
 * Created by tdzl2003 on 2017/7/22.
 */

module.exports = function mockResponse(opts) {
  const getResult = typeof(opts) === 'function' ? opts : () => opts;

  const ret = (ctx, next) => {
    if (ctx.headers['x-mock']) {
      ctx.body = getResult();
      return;
    }
    return next();
  };

  ret.meta = function(json) {
    json.mockResponse = getResult();
  };

  ret.html = function() {
    const val = getResult();
    return `<h4>Sample Response:</h4>
<div>
${typeof(val) === 'object' ? JSON.stringify(val, true) : val}
</div>`;
  };

  return ret;
}
