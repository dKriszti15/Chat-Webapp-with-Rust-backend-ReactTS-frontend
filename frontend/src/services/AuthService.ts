import backendConfig from "../config/backendConfig";

export function login(username: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {

    return fetch(`${backendConfig.backendURL}/auth/login`, 
    {
      method: "POST",
      headers: new Headers({'content-type': 'application/json'}),
      body: JSON.stringify({username, password})
    })
    .then((response) => {
      if (response.status >= 400 && response.status < 500) {
        response.text().then(
          (errorText) => reject(`${errorText}`)
        );
        throw response;
        
      } else if (response.status >= 500) {
        reject(`${response.status}: Szerveroldali hiba!`);
        throw response;
      }
      return response;
    })
    .then((response) => response.text())
    .then((text) => resolve(text.toString()))
    .catch(() => {});
  });
}

export interface UserInDTO {
  username: string,
  display_name: string,
  password: string,
  password_again: string
}


export function register(user: UserInDTO): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(user)
      const response = await fetch(`${backendConfig.backendURL}/auth/register`,
        {
          method: "POST",
          headers: new Headers({ 'content-type': 'application/json' }),
          body: JSON.stringify(user)
        });
      if (response.status >= 400 && response.status < 500) {
        response.text().then(
          (errorText) => reject(`${errorText}`)
        );
        throw response;

      } else if (response.status >= 500) {
        reject(`${response.status}: Szerveroldali hiba!`);
        throw response;
      }
      const response_1 = response;
      const text = await response_1.text();
      return resolve(text.toString());
    } catch { }
  });
}