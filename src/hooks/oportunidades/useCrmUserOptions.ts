import { useCallback, useEffect, useState } from "react";
import { Option } from "../../types";
import { UserService } from "../../services/UserService";

export const useCrmUserOptions = () => {
  const [userOptions, setUserOptions] = useState<Option[]>([]);

  const fetchUsers = useCallback(async () => {
    const response = await UserService.getMany({ PERM_CRM: 1 });
    const options = response.map((user) => ({
      id: user.CODPESSOA,
      name: user.NOME,
    }));

    setUserOptions(options);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { userOptions };
};
