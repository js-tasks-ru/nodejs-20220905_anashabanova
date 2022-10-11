const Validator = require('../Validator');
const expect = require('chai').expect;

describe('testing-configuration-logging/unit-tests', () => {
  describe('Validator', () => {
    it('валидатор проверяет строковые поля', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({name: 'Lalala'});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal('too short, expect 10, got 6');
    });

    it('валидатор проверяет поля по типу', () => {
      const validator = new Validator({
        age: {
          type: 'number',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({age: true});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal('expect number, got boolean');
    });

    it('валидатор игнорирует поле, для которого не зададна конфигурация', () => {
      const validator = new Validator({
        age: {
          type: 'number',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({lastName: 'BBBB', age: 12});

      expect(errors).to.have.length(0);
    });

    it('валидатор не требует передачи на валидацию всех полей, указанных в конфигурации', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 2,
          max: 20,
        },
        lastName: {
          type: 'number',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({lastName: 12});

      expect(errors).to.have.length(0);
    });

    it('валидатор корректно накапливает ошибки для нескольких переданных полей', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 2,
          max: 20,
        },
        age: {
          type: 'number',
          min: 10,
          max: 20,
        },
      });

      const errors = validator.validate({name: true, age: 32});

      expect(errors).to.have.length(2);
    });

    it('валидатор отработает, если передать некорректный аргумент на проверку', () => {
      const validator = new Validator({
        name: {
          type: 'string',
          min: 2,
          max: 20,
        },
        age: {
          type: 'number',
          min: 10,
          max: 20,
        },
      });

      const errorsOfNull = validator.validate(null);
      expect(errorsOfNull).to.have.length(0);

      const errorsOfUndef = validator.validate();
      expect(errorsOfUndef).to.have.length(0);

      const errorsOfNum = validator.validate(7);
      expect(errorsOfNum).to.have.length(0);

      const errorsOfStr = validator.validate('abc');
      expect(errorsOfStr).to.have.length(0);
    });
  });
});
