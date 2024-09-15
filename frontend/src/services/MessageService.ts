import backendConfig from "../config/backendConfig";

export interface MessageInDTO{
    from_user: string,
    to_user: string,
    msg: string,
    date_time: string
}

export function saveMessage(message: MessageInDTO): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(message)
            const response = await fetch(`${backendConfig.backendURL}/messages/save`,
              {
                method: "POST",
                headers: new Headers({ 'content-type': 'application/json' }),
                body: JSON.stringify(message)
              });
            if (response.status >= 400 && response.status < 500) {
              response.text().then(
                (errorText) => reject(`${errorText}`)
              );
              throw response;
      
            } else if (response.status >= 500) {
              reject(`${response.status}: Server error!`);
              throw response;
            }
            const response_1 = response;
            const text = await response_1.text();
            return resolve(text.toString());
          } catch { }
        });
}

export async function loadMessages_all(): Promise<MessageInDTO[]> {
  const response = await fetch(`${backendConfig.backendURL}/messages/load-all`, {
    method: "GET",
    headers: new Headers({
      "content-type": "application/json"
    }),
  });
  console.log(response.json)
  return await response.json();
}