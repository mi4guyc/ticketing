import axios from "axios";
import { useState } from "react";
//
// CLIENT-SIDE CODE
//

const KUBE_URL_ROOT =
  //  "http://ingress-nginx.controller.ingress-nginx.svc.cluster.local";
  // "http://auth-srv:3000";
  "";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](`${KUBE_URL_ROOT}${url}`, {
        ...body,
        ...props,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      // console.log(err, `${KUBE_URL_ROOT}${url}`);

      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>
          <ul className="my-0">
            {err.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
