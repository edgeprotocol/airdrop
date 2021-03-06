contract("FixedSupplyUpgraderConversions", function(accounts) {
    const account    = accounts[0];
    const bntWallet  = accounts[1];
    const airDropper = accounts[2];

    const supply  = web3.toBigNumber("1e24");
    const reserve = web3.toBigNumber("1e22");
    const amount  = web3.toBigNumber("1e20");

    const config = {
        "etherTokenParams": {
            "supply": supply
        },
        "smartToken1Params": {
            "name": "Bancor Network Token",
            "symbol": "BNT",
            "decimals": 18,
            "supply": supply
        },
        "smartToken2Params": {
            "name": "Smart Token Of Chayot",
            "symbol": "STC",
            "decimals": 18,
            "supply": supply
        },
        "smartToken3Params": {
            "name": "XXX/BNT Relay Token",
            "symbol": "XXXBNT",
            "decimals": 18,
            "supply": supply
        },
        "smartToken4Params": {
            "name": "YYY/BNT Relay Token",
            "symbol": "YYYBNT",
            "decimals": 18,
            "supply": supply
        },
        "smartToken5Params": {
            "name": "BNT/ETH Relay Token",
            "symbol": "BNTETH",
            "decimals": 18,
            "supply": supply
        },
        "erc20TokenAParams": {
            "name": "XXX Standard Token",
            "symbol": "XXX",
            "decimals": 18,
            "supply": supply
        },
        "erc20TokenBParams": {
            "name": "YYY Standard Token",
            "symbol": "YYY",
            "decimals": 18,
            "supply": supply
        },
        "converter1Params": {
            "fee": 0,
            "ratio1": 100000,
            "reserve1": reserve
        },
        "converter2Params": {
            "fee": 0,
            "ratio1": 500000,
            "reserve1": reserve
        },
        "converter3Params": {
            "fee": 1000,
            "ratio1": 500000,
            "reserve1": reserve,
            "ratio2": 500000,
            "reserve2": reserve
        },
        "converter4Params": {
            "fee": 1000,
            "ratio1": 500000,
            "reserve1": reserve,
            "ratio2": 500000,
            "reserve2": reserve
        },
        "converter5Params": {
            "fee": 0,
            "ratio1": 500000,
            "reserve1": reserve,
            "ratio2": 500000,
            "reserve2": reserve
        },
        "priceLimitParams": {
            "value": "6e9"
        }
    };

    let contractRegistry           ;
    let contractFeatures           ;
    let fixedSupplyUpgrader        ;
    let bancorFormula              ;
    let bancorNetwork              ;
    let bancorNetworkPathFinder    ;
    let bancorConverterUpgrader    ;
    let bancorConverterRegistry    ;
    let bancorConverterRegistryData;
    let bancorGasPriceLimit        ;
    let etherToken                 ;
    let smartToken1                ;
    let smartToken2                ;
    let smartToken3                ;
    let smartToken4                ;
    let smartToken5                ;
    let erc20TokenA                ;
    let erc20TokenB                ;
    let bancorConverter1           ;
    let bancorConverter2           ;
    let bancorConverter3           ;
    let bancorConverter4           ;
    let bancorConverter5           ;
    let gasPrice                   ;

    const paths = {};

    before(async function() {
        contractRegistry            = await artifacts.require("ContractRegistry"           ).new();
        contractFeatures            = await artifacts.require("ContractFeatures"           ).new();
        fixedSupplyUpgrader         = await artifacts.require("FixedSupplyUpgrader"        ).new();
        bancorFormula               = await artifacts.require("BancorFormula"              ).new();
        bancorNetwork               = await artifacts.require("BancorNetwork"              ).new(contractRegistry.address);
        bancorNetworkPathFinder     = await artifacts.require("BancorNetworkPathFinder"    ).new(contractRegistry.address);
        bancorConverterUpgrader     = await artifacts.require("BancorConverterUpgrader"    ).new(contractRegistry.address);
        bancorConverterRegistry     = await artifacts.require("BancorConverterRegistry"    ).new(contractRegistry.address);
        bancorConverterRegistryData = await artifacts.require("BancorConverterRegistryData").new(contractRegistry.address);
        bancorGasPriceLimit         = await artifacts.require("BancorGasPriceLimit"        ).new(config.priceLimitParams.value);
        etherToken                  = await artifacts.require("EtherToken"                 ).new();
        smartToken1                 = await artifacts.require("SmartToken"                 ).new(config.smartToken1Params.name, config.smartToken1Params.symbol, config.smartToken1Params.decimals);
        smartToken2                 = await artifacts.require("SmartToken"                 ).new(config.smartToken2Params.name, config.smartToken2Params.symbol, config.smartToken2Params.decimals);
        smartToken3                 = await artifacts.require("SmartToken"                 ).new(config.smartToken3Params.name, config.smartToken3Params.symbol, config.smartToken3Params.decimals);
        smartToken4                 = await artifacts.require("SmartToken"                 ).new(config.smartToken4Params.name, config.smartToken4Params.symbol, config.smartToken4Params.decimals);
        smartToken5                 = await artifacts.require("SmartToken"                 ).new(config.smartToken5Params.name, config.smartToken5Params.symbol, config.smartToken5Params.decimals);
        erc20TokenA                 = await artifacts.require("ERC20Token"                 ).new(config.erc20TokenAParams.name, config.erc20TokenAParams.symbol, config.erc20TokenAParams.decimals, config.erc20TokenAParams.supply);
        erc20TokenB                 = await artifacts.require("ERC20Token"                 ).new(config.erc20TokenBParams.name, config.erc20TokenBParams.symbol, config.erc20TokenBParams.decimals, config.erc20TokenBParams.supply);
        bancorConverter1            = await artifacts.require("BancorConverter"            ).new(smartToken1.address, contractRegistry.address, config.converter1Params.fee, etherToken .address, config.converter1Params.ratio1);
        bancorConverter2            = await artifacts.require("BancorConverter"            ).new(smartToken2.address, contractRegistry.address, config.converter2Params.fee, smartToken1.address, config.converter2Params.ratio1);
        bancorConverter3            = await artifacts.require("BancorConverter"            ).new(smartToken3.address, contractRegistry.address, config.converter3Params.fee, smartToken1.address, config.converter3Params.ratio1);
        bancorConverter4            = await artifacts.require("BancorConverter"            ).new(smartToken4.address, contractRegistry.address, config.converter4Params.fee, smartToken1.address, config.converter4Params.ratio1);
        bancorConverter5            = await artifacts.require("BancorConverter"            ).new(smartToken5.address, contractRegistry.address, config.converter5Params.fee, smartToken1.address, config.converter5Params.ratio1);
        gasPrice                    = await bancorGasPriceLimit.gasPrice();

        await etherToken.deposit({value: config.etherTokenParams.supply});
        await smartToken1.issue(account, config.smartToken1Params.supply);
        await smartToken2.issue(account, config.smartToken2Params.supply);
        await smartToken3.issue(account, config.smartToken3Params.supply);
        await smartToken4.issue(account, config.smartToken4Params.supply);
        await bancorConverter3.addReserve(erc20TokenA.address, config.converter3Params.ratio2);
        await bancorConverter4.addReserve(erc20TokenB.address, config.converter4Params.ratio2);
        await bancorConverter5.addReserve(etherToken .address, config.converter5Params.ratio2);
        await contractRegistry.registerAddress(web3.fromAscii("ContractRegistry"           ), contractRegistry           .address);
        await contractRegistry.registerAddress(web3.fromAscii("ContractFeatures"           ), contractFeatures           .address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorFormula"              ), bancorFormula              .address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorNetwork"              ), bancorNetwork              .address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorNetworkPathFinder"    ), bancorNetworkPathFinder    .address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorConverterUpgrader"    ), bancorConverterUpgrader    .address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorConverterRegistry"    ), bancorConverterRegistry    .address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorConverterRegistryData"), bancorConverterRegistryData.address);
        await contractRegistry.registerAddress(web3.fromAscii("BancorGasPriceLimit"        ), bancorGasPriceLimit        .address);
        await contractRegistry.registerAddress(web3.fromAscii("BNTToken"                   ), smartToken1                .address);
        await contractRegistry.registerAddress(web3.fromAscii("BNTConverter"               ), bancorConverter1           .address);
        await etherToken .transfer(bancorConverter1.address, config.converter1Params.reserve1);
        await smartToken1.transfer(bancorConverter2.address, config.converter2Params.reserve1);
        await smartToken1.transfer(bancorConverter3.address, config.converter3Params.reserve1);
        await smartToken1.transfer(bancorConverter4.address, config.converter4Params.reserve1);
        await erc20TokenA.transfer(bancorConverter3.address, config.converter3Params.reserve2);
        await erc20TokenB.transfer(bancorConverter4.address, config.converter4Params.reserve2);
        await smartToken1.transferOwnership(bancorConverter1.address);
        await smartToken2.transferOwnership(bancorConverter2.address);
        await smartToken3.transferOwnership(bancorConverter3.address);
        await smartToken4.transferOwnership(bancorConverter4.address);
        await bancorConverter1.acceptTokenOwnership();
        await bancorConverter2.acceptTokenOwnership();
        await bancorConverter3.acceptTokenOwnership();
        await bancorConverter4.acceptTokenOwnership();
        await bancorConverterRegistry.addConverter(bancorConverter1.address);
        await bancorConverterRegistry.addConverter(bancorConverter2.address);
        await bancorConverterRegistry.addConverter(bancorConverter3.address);
        await bancorConverterRegistry.addConverter(bancorConverter4.address);
        await bancorNetworkPathFinder.setAnchorToken(etherToken.address);
        await bancorNetwork.registerEtherToken(etherToken.address, true);
    });

    it("before execute", async function() {
        for (const sourceToken of [smartToken1, smartToken2, erc20TokenA, erc20TokenB]) {
            paths[sourceToken.address] = {};
            for (const targetToken of [smartToken1, smartToken2, erc20TokenA, erc20TokenB]) {
                paths[sourceToken.address][targetToken.address] = await bancorNetworkPathFinder.generatePath(sourceToken.address, targetToken.address);
            }
        }
        paths[etherToken.address] = {};
        for (const token of [smartToken1, smartToken2, erc20TokenA, erc20TokenB]) {
            paths[token.address][etherToken.address] = paths[token.address][smartToken1.address].concat([smartToken1.address, etherToken.address]);
            paths[etherToken.address][token.address] = [etherToken.address, smartToken1.address].concat(paths[smartToken1.address][token.address]);
        }
        await claimAndConvert();
    });

    it("during execute", async function() {
        await bancorConverter1   .transferOwnership(fixedSupplyUpgrader.address, {from: account});
        await bancorConverter5   .transferOwnership(fixedSupplyUpgrader.address, {from: account});
        await smartToken5        .transferOwnership(fixedSupplyUpgrader.address, {from: account});
        await smartToken1        .transfer(bntWallet, await smartToken1.balanceOf(account), {from: account});
        await smartToken1        .approve(fixedSupplyUpgrader.address, await smartToken1.totalSupply(), {from: bntWallet});
        await contractRegistry   .registerAddress(web3.fromAscii("BancorConverterUpgrader"), fixedSupplyUpgrader.address, {from: account});
        await fixedSupplyUpgrader.execute(bancorConverter1.address, bancorConverter5.address, bntWallet, airDropper, {from: account});
        await contractRegistry   .registerAddress(web3.fromAscii("BancorConverterUpgrader"), bancorConverterUpgrader.address, {from: account});
        await smartToken1        .transfer(account, await smartToken1.balanceOf(bntWallet), {from: bntWallet});
        await bancorConverter1   .acceptOwnership({from: account});
        await bancorConverter5   .acceptOwnership({from: account});
    });

    it("after execute", async function() {
        for (const token of [smartToken1, smartToken2, erc20TokenA, erc20TokenB]) {
            const x = paths[token.address][etherToken.address].length - 2;
            paths[token.address][etherToken.address][x] = smartToken5.address;
            paths[etherToken.address][token.address][1] = smartToken5.address;
        }
        await claimAndConvert();
    });

    async function claimAndConvert() {
        console.log();
        for (const token of [smartToken1, smartToken2, erc20TokenA, erc20TokenB, etherToken, smartToken3, smartToken4, smartToken5]) {
            const allowance = await token.allowance(account, bancorNetwork.address);
            if (allowance.equals(0)) {
                console.log("approve", await token.symbol());
                await token.approve(bancorNetwork.address, await token.totalSupply());
            }
        }
        for (const sourceToken of [smartToken1, smartToken2, erc20TokenA, erc20TokenB, etherToken]) {
            for (const targetToken of [smartToken1, smartToken2, erc20TokenA, erc20TokenB]) {
                if (sourceToken != targetToken) {
                    console.log("claimAndConvert", await sourceToken.symbol(), "to", await targetToken.symbol());
                    const path = paths[sourceToken.address][targetToken.address];
                    const sourceTokenBalanceBefore = await sourceToken.balanceOf(account);
                    const targetTokenBalanceBefore = await targetToken.balanceOf(account);
                    const response = await bancorNetwork.claimAndConvert(path, amount, 1, {from: account, gasPrice: gasPrice});
                    const sourceTokenBalanceAfter = await sourceToken.balanceOf(account);
                    const targetTokenBalanceAfter = await targetToken.balanceOf(account);
                    const sourceTokenAmount = sourceTokenBalanceBefore.minus(sourceTokenBalanceAfter);
                    const targetTokenAmount = targetTokenBalanceAfter.minus(targetTokenBalanceBefore);
                    assert(sourceTokenAmount.equals(amount), `sourceTokenAmount = ${sourceTokenAmount.toFixed()} ??? ${amount.toFixed()}`);
                    assert(targetTokenAmount.greaterThan(0), `targetTokenAmount = ${targetTokenAmount.toFixed()} < 0`);
                }
            }
        }
        for (const sourceToken of [smartToken1, smartToken2, erc20TokenA, erc20TokenB]) {
            for (const targetToken of [etherToken]) {
                if (sourceToken != targetToken) {
                    console.log("claimAndConvert", await sourceToken.symbol(), "to", await targetToken.symbol());
                    const path = paths[sourceToken.address][targetToken.address];
                    const sourceTokenBalanceBefore = await sourceToken.balanceOf(account);
                    const targetTokenBalanceBefore = await web3.eth.getBalance  (account);
                    const response = await bancorNetwork.claimAndConvert(path, amount, 1, {from: account, gasPrice: gasPrice});
                    const sourceTokenBalanceAfter = await sourceToken.balanceOf(account);
                    const targetTokenBalanceAfter = await web3.eth.getBalance  (account);
                    const sourceTokenAmount = sourceTokenBalanceBefore.minus(sourceTokenBalanceAfter);
                    const targetTokenAmount = targetTokenBalanceAfter.minus(targetTokenBalanceBefore).plus(gasPrice.times(response.receipt.gasUsed));
                    assert(sourceTokenAmount.equals(amount), `sourceTokenAmount = ${sourceTokenAmount.toFixed()} ??? ${amount.toFixed()}`);
                    assert(targetTokenAmount.greaterThan(0), `targetTokenAmount = ${targetTokenAmount.toFixed()} < 0`);
                }
            }
        }
    }
});
