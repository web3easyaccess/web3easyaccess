# web3easyaccess

### local develope step by step

1. start local evm chain by anvil, in a new terminal:

```
anvil
```

2. deploy contract to local chain, in a new terminal(the private key, it's the first of anvil's result):

```
cd web3easyaccess/contract/
forge script script/DeployAdministrator.s.sol:AdministratorScript --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --rpc-url http://127.0.0.1:8545 --slow --via-ir --legacy
```

3. set administrator's contract address to .env file;

4. start web server:

```
cd web3easyaccess/web
npm run dev
```

5. visit: `http://localhost:3000`
