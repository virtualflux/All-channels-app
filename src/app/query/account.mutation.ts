import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AccountType } from "../api/db/accounts/schema";

const useCreateAccount = () => {
  const { mutate } = useMutation({
    mutationFn: (data) => {
      return axios.post("/api/db/accounts", data);
    },
  });

  return { mutate };
};
