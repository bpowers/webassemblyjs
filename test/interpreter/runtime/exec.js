// @flow

const {assert} = require('chai');

const t = require('../../../lib/compiler/AST');
const {executeStackFrame} = require('../../../lib/interpreter/kernel/exec');
const {createStackFrame} = require('../../../lib/interpreter/kernel/stackframe');

describe('kernel exec', () => {
  describe('instructions', () => {

    describe('control', () => {
      it('should execute nop', () => {
        let pc;

        const code = [
          t.instruction('nop'),
          t.instruction('nop'),
          t.instruction('nop'),
        ];

        const stackFrame = createStackFrame(code, []);
        stackFrame.trace = (x) => (pc = x);

        executeStackFrame(stackFrame);

        assert.equal(code.length, pc + 1);
      });
    });

    describe('administrative', () => {

      it('should stop executing the stackframe at trap', () => {
        let pc;

        const code = [
          t.instruction('nop'),
          t.instruction('nop'),
          t.instruction('trap'),
          t.instruction('nop'),
          t.instruction('nop'),
        ];

        const stackFrame = createStackFrame(code, []);
        stackFrame.trace = (x) => (pc = x);

        executeStackFrame(stackFrame);

        assert.notEqual(code.length, pc + 1);
        assert.equal(pc, 1);
      });
    });

    describe('binop', () => {

      const operations = [
        {
          name: 'i32.add',

          args: [
            {value: 1, type: 'i32'},
            {value: 1, type: 'i32'},
          ],

          code: [
            t.instruction('get_local', [0]),
            t.instruction('get_local', [1]),
            t.instruction('i32.add'),
          ],

          resEqual: 2,
        },

        {
          name: 'i32.sub',

          args: [
            {value: 1, type: 'i32'},
            {value: 1, type: 'i32'},
          ],

          code: [
            t.instruction('get_local', [0]),
            t.instruction('get_local', [1]),
            t.instruction('i32.sub'),
          ],

          resEqual: 0,
        },

        {
          name: 'i32.mul',

          args: [
            {value: 2, type: 'i32'},
            {value: 1, type: 'i32'},
          ],

          code: [
            t.instruction('get_local', [0]),
            t.instruction('get_local', [1]),
            t.instruction('i32.mul'),
          ],

          resEqual: 2,
        },

      ];

      operations.forEach((op) => {

        describe(op.name, () => {
          it('should get the correct result', () => {

            const stackFrame = createStackFrame(op.code, op.args);
            const res = executeStackFrame(stackFrame);

            assert.equal(res, op.resEqual);
          });

          it('should assert validations - 1 missing arg', () => {
            const stackFrame = createStackFrame(op.code, op.args.slice(-1));
            const fn = () => executeStackFrame(stackFrame);

            assert.throws(fn, /Assertion error/);
          });
        });

      });

    });
  });
});