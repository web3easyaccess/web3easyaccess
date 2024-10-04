/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/easyaccess.json`.
 */
export type Easyaccess = {
    address: "BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD";
    metadata: {
        name: "easyaccess";
        version: "0.1.0";
        spec: "0.1.0";
        description: "Created with Anchor";
    };
    instructions: [
        {
            name: "changeAcctPasswdAddr";
            discriminator: [236, 234, 133, 242, 13, 180, 251, 90];
            accounts: [
                {
                    name: "payerAcct";
                    signer: true;
                },
                {
                    name: "userPasswdAcct";
                    signer: true;
                },
                {
                    name: "userAcct";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "arg";
                                path: "ownerId";
                            }
                        ];
                    };
                }
            ];
            args: [
                {
                    name: "ownerId";
                    type: "string";
                },
                {
                    name: "newPasswdAddr";
                    type: "string";
                },
                {
                    name: "questionNos";
                    type: "string";
                }
            ];
        },
        {
            name: "createAcct";
            discriminator: [249, 106, 189, 96, 83, 99, 15, 113];
            accounts: [
                {
                    name: "payerAcct";
                    writable: true;
                    signer: true;
                },
                {
                    name: "userAcct";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "arg";
                                path: "ownerId";
                            }
                        ];
                    };
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [
                {
                    name: "ownerId";
                    type: "string";
                },
                {
                    name: "passwdAddr";
                    type: "string";
                },
                {
                    name: "questionNos";
                    type: "string";
                }
            ];
        },
        {
            name: "transferAcctLamports";
            discriminator: [216, 166, 104, 99, 65, 29, 133, 19];
            accounts: [
                {
                    name: "payerAcct";
                    signer: true;
                },
                {
                    name: "userPasswdAcct";
                    signer: true;
                },
                {
                    name: "userAcct";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "arg";
                                path: "ownerId";
                            }
                        ];
                    };
                },
                {
                    name: "toAccount";
                    writable: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [
                {
                    name: "ownerId";
                    type: "string";
                },
                {
                    name: "lamports";
                    type: "u64";
                }
            ];
        }
    ];
    accounts: [
        {
            name: "acctEntity";
            discriminator: [50, 180, 28, 58, 154, 174, 238, 161];
        }
    ];
    types: [
        {
            name: "acctEntity";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "ownerId";
                        type: "string";
                    },
                    {
                        name: "passwdAddr";
                        type: "string";
                    },
                    {
                        name: "questionNos";
                        type: "string";
                    },
                    {
                        name: "bump";
                        type: "u8";
                    }
                ];
            };
        }
    ];
};
