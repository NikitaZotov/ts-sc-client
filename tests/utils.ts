import { Request, Response } from "../src/ScClient";
import WS from "jest-websocket-mock";

const EVENT_ID = 7;

const getMockAnswerPayload = (data: Request) => {
  if (data.type === "create_elements") {
    return data.payload.map((_: any, ind: number) => ind);
  }
  if (data.type === "create_elements_by_scs") {
    return data.payload.map((_: any, ind: boolean) => ind);
  }
  if (data.type === "parse_scs") {
    return [
        {
            "errors": [],
            "root": {
                "children": [
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "children": [
                                            {
                                                "children": [
                                                    {
                                                        "children": [],
                                                        "position": {
                                                            "beginIndex": 5,
                                                            "beginLine": 1,
                                                            "endIndex": 6,
                                                            "endLine": 1
                                                        },
                                                        "ruleType": "connector",
                                                        "token": "->"
                                                    },
                                                    {
                                                        "children": [
                                                            {
                                                                "children": [
                                                                    {
                                                                        "children": [
                                                                            {
                                                                                "children": [],
                                                                                "position": {
                                                                                    "beginIndex": 8,
                                                                                    "beginLine": 1,
                                                                                    "endIndex": 11,
                                                                                    "endLine": 1
                                                                                },
                                                                                "ruleType": "idtf_system",
                                                                                "token": "y536"
                                                                            }
                                                                        ],
                                                                        "position": {
                                                                            "beginIndex": 8,
                                                                            "beginLine": 1,
                                                                            "endIndex": 11,
                                                                            "endLine": 1
                                                                        },
                                                                        "ruleType": "idtf_atomic"
                                                                    }
                                                                ],
                                                                "position": {
                                                                    "beginIndex": 8,
                                                                    "beginLine": 1,
                                                                    "endIndex": 11,
                                                                    "endLine": 1
                                                                },
                                                                "ruleType": "idtf_common"
                                                            }
                                                        ],
                                                        "position": {
                                                            "beginIndex": 8,
                                                            "beginLine": 1,
                                                            "endIndex": 11,
                                                            "endLine": 1
                                                        },
                                                        "ruleType": "idtf_list"
                                                    }
                                                ],
                                                "position": {
                                                    "beginIndex": 5,
                                                    "beginLine": 1,
                                                    "endIndex": 11,
                                                    "endLine": 1
                                                },
                                                "ruleType": "sentence_lvl_4_list_item"
                                            },
                                            {
                                                "children": [
                                                    {
                                                        "children": [
                                                            {
                                                                "children": [],
                                                                "position": {
                                                                    "beginIndex": 0,
                                                                    "beginLine": 1,
                                                                    "endIndex": 3,
                                                                    "endLine": 1
                                                                },
                                                                "ruleType": "idtf_system",
                                                                "token": "x123"
                                                            }
                                                        ],
                                                        "position": {
                                                            "beginIndex": 0,
                                                            "beginLine": 1,
                                                            "endIndex": 3,
                                                            "endLine": 1
                                                        },
                                                        "ruleType": "idtf_atomic"
                                                    }
                                                ],
                                                "position": {
                                                    "beginIndex": 0,
                                                    "beginLine": 1,
                                                    "endIndex": 3,
                                                    "endLine": 1
                                                },
                                                "ruleType": "idtf_common"
                                            }
                                        ],
                                        "position": {
                                            "beginIndex": 0,
                                            "beginLine": 1,
                                            "endIndex": 11,
                                            "endLine": 1
                                        },
                                        "ruleType": "sentence_lvl_common"
                                    }
                                ],
                                "position": {
                                    "beginIndex": 0,
                                    "beginLine": 1,
                                    "endIndex": 11,
                                    "endLine": 1
                                },
                                "ruleType": "sentence"
                            }
                        ],
                        "position": {
                            "beginIndex": 0,
                            "beginLine": 1,
                            "endIndex": 13,
                            "endLine": 1
                        },
                        "ruleType": "sentence_wrap",
                        "token": ";;"
                    }
                ],
                "ruleType": "syntax"
            }
        }
    ];
  }
  if (data.type === "check_elements") {
    return data.payload.map((_: any, ind: number) => ind);
  }
  if (data.type === "content") {
    return data.payload.map(({ command }: { command: "set" | "get" | "find" | "find_links_by_substr" | "find_strings_by_substr" }) => {
        if (command === "set") {
          return true;
        }
        if (command === "get") {
          return {value: "12345", type: "string"};
        }
        if (command === "find_strings_by_substr") {
          return ["test_string"];
        }
        else {
          return [12345];
        }
      }
    );
  }
  if (data.type === "keynodes") {
    return data.payload.map((_: any, ind: number) => ind + 1);
  }
  if (["search_template", "generate_template"].includes(data.type)) {
    return {
      aliases: {},
      addrs: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    };
  }
  if (data.type === "events") {
    return [EVENT_ID];
  }
  return [];
};

const getMockAnswerErrors = (data: Request) => {
  if (data.type === "create_elements_by_scs" && data.payload[0] == "->;;") {
    return [{ ref: 1, message: "Parse error" }];
  }

  return [];
}

export const setupServer = (server: WS) => {
  server.on("connection", (socket) => {
    socket.on(
      "message",
      (JSONdata: string | Blob | ArrayBuffer | ArrayBufferView) => {
        if (typeof JSONdata !== "string") return;

        const data = JSON.parse(JSONdata) as Request;
        const dataToSend: Response = {
          id: data.id,
          status: true,
          event: false,
          payload: getMockAnswerPayload(data),
          errors: getMockAnswerErrors(data),
        };

        server.send(dataToSend);
        if (data.type === "events" && !data.payload.delete) {
          server.send({
            id: EVENT_ID,
            status: true,
            event: true,
            payload: [1, 2, 3],
            errors: getMockAnswerErrors(data),
          });
        }
      }
    );
  });
};
