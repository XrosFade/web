import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Link, Text, useToast } from '@chakra-ui/react'
import { ChainTypes } from '@shapeshiftoss/types'
import { useTranslate } from 'react-polyglot'
import { SendInput } from 'components/Modals/Send/Form'
import { useChainAdapters } from 'context/ChainAdaptersProvider/ChainAdaptersProvider'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useWallet } from 'context/WalletProvider/WalletProvider'
import { bnOrZero } from 'lib/bignumber/bignumber'

export const useFormSend = () => {
  const toast = useToast()
  const translate = useTranslate()
  const chainAdapterManager = useChainAdapters()
  const { send } = useModal()
  const {
    state: { wallet }
  } = useWallet()

  const handleSend = async (data: SendInput) => {
    if (wallet) {
      try {
        const adapter = chainAdapterManager.byChain(data.asset.chain)
        // const value = bnOrZero(data.cryptoAmount)
        // .times(bnOrZero(10).exponentiatedBy(data.asset.precision))
        // .toFixed(0)

        const adapterType = adapter.getType()

        let result

        // const { estimatedFees, feeType, address: to } = data
        if (adapterType === ChainTypes.Cosmos) {
          // TODO(gomes): wire up
          // const fees = estimatedFees[feeType] as chainAdapters.FeeData<ChainTypes.Ethereum>
          // const gasPrice = fees.chainSpecific.gasPrice
          // const gasLimit = fees.chainSpecific.gasLimit
          // const address = isEthAddress(to) ? to : ((await ensLookup(to)).address as string)
          // result = await (adapter as ChainAdapter<ChainTypes.Ethereum>).buildSendTransaction({
          // to: address,
          // value,
          // wallet,
          // chainSpecific: { erc20ContractAddress: data.asset.tokenId, gasPrice, gasLimit },
          // sendMax: data.sendMax
          // })
        }
        if (adapterType === ChainTypes.Cosmos) {
          // TODO
        } else {
          throw new Error('unsupported adapterType')
        }
        // const txToSign = result.txToSign

        let broadcastTXID: string | undefined

        // Native and KeepKey hdwallets only support offline signing, not broadcasting signed TXs like e.g Metamask
        if (wallet.supportsOfflineSigning()) {
          // TODO(gomes): wire up
          // const signedTx = await adapter.signTransaction({ txToSign, wallet })
          // broadcastTXID = await adapter.broadcastTransaction(signedTx)
        } else {
          throw new Error('Bad hdwallet config')
        }

        toast({
          title: translate('modals.send.sent', { asset: data.asset.name }),
          description: (
            <Text>
              <Text>
                {translate('modals.send.youHaveSent', {
                  amount: data.cryptoAmount,
                  symbol: data.cryptoSymbol
                })}
              </Text>
              {data.asset.explorerTxLink && (
                <Link href={`${data.asset.explorerTxLink}${broadcastTXID}`} isExternal>
                  {translate('modals.status.viewExplorer')} <ExternalLinkIcon mx='2px' />
                </Link>
              )}
            </Text>
          ),
          status: 'success',
          duration: 9000,
          isClosable: true,
          position: 'top-right'
        })
      } catch (error) {
        toast({
          title: translate('modals.send.errorTitle', {
            asset: data.asset.name
          }),
          description: translate('modals.send.errors.transactionRejected'),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top-right'
        })
      } finally {
        send.close()
      }
    }
  }
  return {
    handleSend
  }
}
