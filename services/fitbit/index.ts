import axios from "axios";
import httpErrors from "http-errors";
import { EMethod } from "../../types";

const fitbitErrorMap = {
  401: httpErrors[401],
};

const headers = {};

const urls = {};

const getFitbitData = async (url: string, method: EMethod) => {
  await axios({
    url,
    method,
    headers
  })
}

const fitbitService = () => {
  urls: {

  },
  headers: {

  },
  getWeight() {
    try {
      getFitbitData(this.headers, EMethod.GET)
    }
  },
};

export { fitbitService };
