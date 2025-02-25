import { Button } from '@chakra-ui/react'
import { BuySellIcon } from 'components/Icons/BuySell'
import { Text } from 'components/Text'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useWallet, WalletActions } from 'context/WalletProvider/WalletProvider'

export const FiatRamps = () => {
  const { fiatRamps } = useModal()
  const {
    state: { isConnected },
    dispatch
  } = useWallet()
  const handleWalletModalOpen = () =>
    dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true })

  return (
    <Button
      leftIcon={<BuySellIcon color='inherit' />}
      colorScheme='blue'
      width='full'
      onClick={() => (isConnected ? fiatRamps.open({}) : handleWalletModalOpen())}
      variant='ghost-filled'
      justifyContent={{ base: 'flex-start', md: 'center' }}
    >
      <Text translation='fiatRamps.headerLabel' />
    </Button>
  )
}
