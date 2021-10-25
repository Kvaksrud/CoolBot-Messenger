function randomReply(amount,currency){
    const laborTemplates = [
        {'destination': 'balance', 'text': `You picked up some trash on your way to the bus stop and got rewarded ${amount} ${currency} by the mayor.`},
        {'destination': 'wallet', 'text': `A thief tried to rob you, but you hit him first making him drop his wallet. You kept ${amount} ${currency}.`},
        {'destination': 'balance', 'text': `You made ${amount} ${currency} squeezing rubber ducks at the rubber duck factory.`},
        {'destination': 'balance', 'text': `You won ${amount} ${currency} in the lottery!`},
        {'destination': 'wallet', 'text': `You found a mysterious envelope on the train. When you opened it you found ${amount} ${currency} that you stached in your wallet.`},
    ]

    return laborTemplates[Math.floor(Math.random() * laborTemplates.length)]; // Select random prefix
}

module.exports = {
    randomReply
}