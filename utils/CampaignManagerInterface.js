import store from '../src/store'
import Web3 from 'web3'
import contract from 'truffle-contract'
import contractJSON from '../build/contracts/CampaignManager.json'
const Contract = contract(contractJSON)

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider)
    Contract.setProvider(web3.currentProvider)
} else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    Contract.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))
}

let contractInstance

const loadCampaignManager = async (c) => {
    contractInstance = await Contract.at("0xb32c941dc0cf4977d9efedd9e1dda53bf6ddf13b")
    console.log("Contract Loaded")
}


const createNewCampaign = async (_startingTime, _endingTime, _goal, _ipfsHash, _presalePrice, _postsalePrice) => {
    return await contractInstance.createCampaign(_startingTime,
        _endingTime,
        _goal * 1000000000000000000,
        _ipfsHash,
        _presalePrice * 1000000000000000000,
        _postsalePrice * 1000000000000000000, {
            from: store.state.defaultEthWallet,
            gasPrice: 2000000000,
            gas: '2000000'
        })
}

const getNumberOfCampaigns = async () => {
    return await contractInstance.campaignCount()
}

//Function assumes a fraction of ether from the front end so convert to Wei
const fundCampaign = async (_campaignID, _value) => {
    await contractInstance.fundCampaign(_campaignID, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
        value: _value * 1000000000000000000
    })
}

const reduceDonation = async (_campaignID, _value) => {
    await contractInstance.reduceDontation(_campaignID, _value * 1000000000000000000, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
    })
}

const refundFailedCampaign = async (_campaignID) => {
    await contractInstance.refundFailedCampaign(_campaignID, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
    })
}

const withdrawCampaignFunds = async (_campaignID) => {
    await contractInstance.withdrawCampaignFunds(_campaignID, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
    })
}

const fetchCampaign = async (_campaignID) => {
    return await contractInstance.fetchCampaign(_campaignID)
}

const validateLicence = async (_campaignID) => {
    return await contractInstance.fetchCampaignLicenses(_campaignID, store.state.defaultEthWallet)
}

export {
    loadCampaignManager,
    createNewCampaign,
    getNumberOfCampaigns,
    fundCampaign,
    reduceDonation,
    refundFailedCampaign,
    withdrawCampaignFunds,
    fetchCampaign,
    validateLicence
}