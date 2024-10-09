/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/easyaccess.json`.
 */
export type Easyaccess = {
  "address": "BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD",
  "metadata": {
    "name": "easyaccess",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "changeAcctPasswdAddr",
      "discriminator": [
        236,
        234,
        133,
        242,
        13,
        180,
        251,
        90
      ],
      "accounts": [
        {
          "name": "payerAcct",
          "writable": true,
          "signer": true
        },
        {
          "name": "userPasswdAcct",
          "signer": true
        },
        {
          "name": "newPasswdAcct",
          "signer": true
        },
        {
          "name": "userAcct",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "ownerId"
              }
            ]
          }
        },
        {
          "name": "bigBrotherAcct"
        }
      ],
      "args": [
        {
          "name": "ownerId",
          "type": "bytes"
        },
        {
          "name": "questionNos",
          "type": "string"
        },
        {
          "name": "transFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createFirstAcct",
      "docs": [
        "* lamports: transfer amount in lamports\n     * trans_fee_lamports: transaction's fee, which should be minus from entity account, and add to payer.\n     * the ownerId must endsWith 0x0000"
      ],
      "discriminator": [
        131,
        206,
        113,
        124,
        9,
        152,
        116,
        217
      ],
      "accounts": [
        {
          "name": "payerAcct",
          "writable": true,
          "signer": true
        },
        {
          "name": "userPasswdAcct",
          "signer": true
        },
        {
          "name": "userAcct",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "ownerId"
              }
            ]
          }
        },
        {
          "name": "toAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ownerId",
          "type": "bytes"
        },
        {
          "name": "questionNos",
          "type": "string"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "transFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createOtherAcct",
      "discriminator": [
        88,
        3,
        252,
        204,
        138,
        167,
        40,
        104
      ],
      "accounts": [
        {
          "name": "payerAcct",
          "writable": true,
          "signer": true
        },
        {
          "name": "userPasswdAcct",
          "signer": true
        },
        {
          "name": "userAcct",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "ownerId"
              }
            ]
          }
        },
        {
          "name": "toAccount",
          "writable": true
        },
        {
          "name": "bigBrotherAcct"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ownerId",
          "type": "bytes"
        },
        {
          "name": "questionNos",
          "type": "string"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "transFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferAcctLamports",
      "discriminator": [
        216,
        166,
        104,
        99,
        65,
        29,
        133,
        19
      ],
      "accounts": [
        {
          "name": "payerAcct",
          "writable": true,
          "signer": true
        },
        {
          "name": "userPasswdAcct",
          "signer": true
        },
        {
          "name": "userAcct",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "ownerId"
              }
            ]
          }
        },
        {
          "name": "toAccount",
          "writable": true
        },
        {
          "name": "bigBrotherAcct"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ownerId",
          "type": "bytes"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "transFeeLamports",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "acctEntity",
      "discriminator": [
        50,
        180,
        28,
        58,
        154,
        174,
        238,
        161
      ]
    }
  ],
  "types": [
    {
      "name": "acctEntity",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ownerId",
            "type": "bytes"
          },
          {
            "name": "bigBrothrAcctAddr",
            "type": "string"
          },
          {
            "name": "passwdAddr",
            "type": "string"
          },
          {
            "name": "questionNos",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
