/**
 * Created by DengYun on 2017/7/26.
 */

const StatusError = require('./StatusError');

module.exports = function statusCode(opts) {
  const codes = Object.keys(opts);
  const ret = (ctx, next) =>{
    return next().catch(err => {
      if (err instanceof StatusError) {
        if (!opts[err.status]) {
          console.warn(`Unexpected status code: ${err.status}.`);
        }
      }
      throw err;
    });
  };

  ret.json = (json) => {
    json.statusCodes = opts;
  };

  ret.html = () => {
    return `<h4>Status Codes:</h4>
<table>
<thead>
<tr><td>Code</td><td>Comment</td></tr>
</thead>
<tbody>
${codes.map(v=>`<tr><td>${v}</td><td>${opts[v]}</td></tr>`).join('')}
</tbody>
</table>`;
  };

  return ret;
};
