/**
 * Created by tdzl2003 on 2017/7/22.
 */

const StatusError = require('./StatusError');

function createValidatorFactory(func) {
    return (...args) => {
        const origin = func( ...args);

        const ret = (values, name) => {
            if (values === undefined) {
                return undefined;
            }
            return origin(values, name);
        };
        ret.json = () => origin.json(false)
        ret.html = () => origin.html(false);
        ret.required = (values, name) => {
            if (values === undefined) {
                throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} is required but missing.`);
            }
            return origin(values, name);
        };
        ret.required.json = () => origin.json(true);
        ret.required.html = () => origin.html(true);
        return ret;
    };
}

function shapeValidator(comment, shape) {
    const fields = Object.keys(shape);
    const ret =  (values, name) => {
        const result = {};
        if (typeof values !== 'object' || values === null) {
            throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} should be a object, but JSON.stringify(${value})`);
        }
        for (const field of fields) {
            result[field] = shape[field](values[field], __DEV__ && `${name}.${field}`);
        }
        return result;
    };

    ret.json = (required) => {
        const ret = {};

        for (const field of fields) {
            ret[field] = shape[field].json();
        }

        return ({
            type: 'shape',
            required,
            comment,
            fields: ret,
        })
    };

    ret.html = (required) => `
<p>${comment} ${required ? '(*)' : ''}</p>
<table>
<thead>
<tr><td>Field</td><td>Description</td></tr>
</thead>
<tbody>
${fields.map(v=>`<tr><td>${v}</td><td>${shape[v].html()}</td></tr>`).join('')}
</tbody>
</table>`;

    return ret;
}

function arrayValidator(comment, type) {
    const ret = (values, name) => {
        if (!Array.isArray(values)) {
            throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} should be a array, but JSON.stringify(${value})`);
        }
        return values.map((v, i) => type(v, __DEV__ && `${name}[${i}]`));
    };

    ret.json = (required) => {
        return ({
            type: 'array',
            required,
            comment,
            elementType: type.json(),
        })
    };

    ret.html = (required) => `
<p>${comment} ${required ? '(*)' : ''} Array of type:</p>
${type.html()}
`;

    return ret;
}

function integerValidator(comment) {
    const ret = (value, name) => {
        if (typeof(value) === 'string') {
            try {
                return parseInt(value);
            } catch (e) {
                // throw exception later.
            }
        } else if (typeof(value) === 'number') {
            return value | 0;
        }
        throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} should be a integer, but JSON.stringify(${value})`);
    };

    ret.json = (required) => {
        return ({
            type: 'integer',
            required,
            comment,
        })
    };

    ret.html = (required) => `
<p>${comment} ${required ? '(*)' : ''} Integer</p>
`;

    return ret;
}

function numberValidator(comment) {
  const ret = (value, name) => {
    if (typeof(value) === 'string') {
      try {
        return parseFloat(value);
      } catch (e) {
        // throw exception later.
      }
    } else if (typeof(value) === 'number') {
      return value;
    }
    throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} should be a number, but JSON.stringify(${value})`);
  };

  ret.json = (required) => {
    return ({
      type: 'integer',
      required,
      comment,
    })
  };

  ret.html = (required) => `
<p>${comment} ${required ? '(*)' : ''} Number</p>
`;

  return ret;
}

function regexpValidator(comment, reg) {
    const ret = (value, name) => {
        if (typeof(value) === 'string') {
            if (!reg.test(value)) {
                throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} should match ${reg.toString()}, but JSON.stringify(${value})`);
            }
            return value;
        }
        throw StatusError.BAD_REQUEST(__DEV__ && `Field ${name} should be a string, but JSON.stringify(${value})`);
    };

    ret.json = (required) => {
        return ({
            type: 'string',
            regexp: reg.toString(),
            required,
            comment,
        });
    };

    ret.html = (required) => `
<p>${comment} ${required ? '(*)' : ''} String</p>
<p>RegExp: ${reg.toString()}</p>
`;
    return ret;
}

exports.shape = createValidatorFactory(shapeValidator);
exports.array = createValidatorFactory(arrayValidator);
exports.integer =  createValidatorFactory(integerValidator);
exports.number =  createValidatorFactory(numberValidator);
exports.regexp = createValidatorFactory(regexpValidator);
