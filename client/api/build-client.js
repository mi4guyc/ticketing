import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // we are on server
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers, // <-- This is apparently the problem
    });
  } else {
    // we are on browser. assume browser will attach
    // base URL
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
