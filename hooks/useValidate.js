import { useState, useEffect } from 'react';

const useValidate = (initialValues, validate, fn) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submit, setSubmit] = useState(false);
  useEffect(() => {
    if (submit) {
      if (!Object.keys(errors).length) {
        fn();
      }
      setSubmit(false);
    }
  }, [errors]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(validate(values));
    setSubmit(true);
  };
  const handleBlur = () => {
    setErrors(validate(values));
  };
  return { values, errors, submit, handleChange, handleSubmit, handleBlur };
};

export default useValidate;
