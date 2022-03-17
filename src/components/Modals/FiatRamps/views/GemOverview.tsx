import { CheckIcon, ChevronRightIcon, CopyIcon, ViewIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text as RawText,
  useToast
} from '@chakra-ui/react'
import { supportsBTC } from '@shapeshiftoss/hdwallet-core'
import { ChainTypes } from '@shapeshiftoss/types'
import { History } from 'history'
import { useEffect, useMemo, useReducer } from 'react'
import { useTranslate } from 'react-polyglot'
import { useParams } from 'react-router'
import { AssetIcon } from 'components/AssetIcon'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useChainAdapters } from 'context/ChainAdaptersProvider/ChainAdaptersProvider'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useWallet } from 'context/WalletProvider/WalletProvider'
import { ensReverseLookup } from 'lib/ens'

import { FiatRampActionButtons } from '../components/FiatRampActionButtons'
import { FiatRampAction, GemManagerAction } from '../const'
import { reducer } from '../reducer'
import { initialState } from '../state'
import { getAssetLogoUrl, makeGemPartnerUrl, middleEllipsis } from '../utils'

type GemOverviewProps = {
  history: History
  selectedAsset: any
  isBTC: any
  btcAddress: string | null
  setBtcAddress: (btcAddress: string) => void
  onFiatRampActionClick: (fiatRampAction: FiatRampAction) => void
  onIsSelectingAsset: (supportsBTC: Boolean, selectAssetTranslation: string) => void
}
export const GemOverview = ({
  history,
  onIsSelectingAsset,
  onFiatRampActionClick,
  setBtcAddress,
  btcAddress,
  selectedAsset,
  isBTC
}: GemOverviewProps) => {
  const translate = useTranslate()
  const { fiatRampAction } = useParams<{ fiatRampAction: FiatRampAction }>()
  const toast = useToast()
  const { fiatRamps } = useModal()

  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    state: { wallet }
  } = useWallet()
  const chainAdapterManager = useChainAdapters()
  const ethChainAdapter = chainAdapterManager.byChain(ChainTypes.Ethereum)
  const btcChainAdapter = chainAdapterManager.byChain(ChainTypes.Bitcoin)

  const addressOrNameFull = isBTC ? btcAddress : state.ensName || state.ethAddress
  const addressFull = isBTC ? btcAddress : state.ethAddress
  const addressOrNameEllipsed =
    isBTC && btcAddress
      ? middleEllipsis(btcAddress, 11)
      : state.ensName || middleEllipsis(state.ethAddress || '', 11)

  useEffect(() => {
    const chainAdapter = wallet && isBTC && supportsBTC(wallet) ? btcChainAdapter : ethChainAdapter

    dispatch({ type: GemManagerAction.SET_SUPPORTS_ADDRESS_VERIFYING, wallet })
    dispatch({
      type: GemManagerAction.SET_CHAIN_ADAPTER,
      chainAdapter: chainAdapter
    })
  }, [wallet, ethChainAdapter, btcChainAdapter, isBTC])

  useEffect(() => {
    ;(async () => {
      if (!wallet || !state.chainAdapter) return
      if (!state.ethAddress && !isBTC) {
        const ethAddress = await state.chainAdapter.getAddress({
          wallet
        })
        dispatch({ type: GemManagerAction.SET_ETH_ADDRESS, ethAddress })
      }
      if (wallet && supportsBTC(wallet) && !btcAddress) {
        const btcAddress = await btcChainAdapter.getAddress({
          wallet
        })
        setBtcAddress(btcAddress)
      }

      if (state.ethAddress && !state.ensName) {
        const reverseEthAddressLookup = await ensReverseLookup(state.ethAddress)
        !reverseEthAddressLookup.error &&
          dispatch({ type: GemManagerAction.SET_ENS_NAME, ensName: reverseEthAddressLookup.name })
      }
    })()
  }, [
    setBtcAddress,
    btcChainAdapter,
    isBTC,
    state.ensName,
    state.ethAddress,
    btcAddress,
    wallet,
    state.chainAdapter
  ])

  const [selectAssetTranslation, assetTranslation, fundsTranslation] = useMemo(
    () =>
      fiatRampAction === FiatRampAction.Buy
        ? ['fiatRamps.selectAnAssetToBuy', 'fiatRamps.assetToBuy', 'fiatRamps.fundsTo']
        : ['fiatRamps.selectAnAssetToSell', 'fiatRamps.assetToSell', 'fiatRamps.fundsFrom'],
    [fiatRampAction]
  )

  const handleCopyClick = async () => {
    const duration = 2500
    const isClosable = true
    const toastPayload = { duration, isClosable }
    try {
      await navigator.clipboard.writeText(addressOrNameFull as string)
      const title = translate('common.copied')
      const status = 'success'
      const description = addressOrNameFull
      toast({ description, title, status, ...toastPayload })
    } catch (e) {
      const title = translate('common.copyFailed')
      const status = 'error'
      const description = translate('common.copyFailedDescription')
      toast({ description, title, status })
    }
  }

  const handleVerify = async () => {
    if (!wallet) return
    const deviceAddress = await state.chainAdapter.getAddress({
      wallet,
      showOnDevice: true
    })
    dispatch({ type: GemManagerAction.SET_SHOWN_ON_DISPLAY, btcAddress, deviceAddress })
  }

  return (
    <SlideTransition>
      <Flex direction='column'>
        <FiatRampActionButtons action={fiatRampAction} setAction={onFiatRampActionClick} />
        <Text
          translation={assetTranslation}
          color='gray.500'
          fontWeight='semibold'
          mt='15px'
          mb='8px'
        />
        <Button
          width='full'
          colorScheme='gray'
          justifyContent='space-between'
          height='70px'
          onClick={() =>
            onIsSelectingAsset(Boolean(wallet && supportsBTC(wallet)), selectAssetTranslation)
          }
          rightIcon={<ChevronRightIcon color='gray.500' boxSize={6} />}
        >
          {selectedAsset ? (
            <Flex alignItems='center'>
              <AssetIcon src={getAssetLogoUrl(selectedAsset)} mr={4} />
              <Box textAlign='left'>
                <RawText lineHeight={1}>{selectedAsset.name}</RawText>
                <RawText fontWeight='normal' fontSize='sm' color='gray.500'>
                  {selectedAsset?.ticker}
                </RawText>
              </Box>
            </Flex>
          ) : (
            <Text translation={selectAssetTranslation} color='gray.500' />
          )}
        </Button>
        {selectedAsset && (
          <Flex flexDirection='column' mb='10px'>
            <Text translation={fundsTranslation} color='gray.500' mt='15px' mb='8px'></Text>
            <InputGroup size='md'>
              <Input pr='4.5rem' value={addressOrNameEllipsed} readOnly />
              <InputRightElement width={state.supportsAddressVerifying ? '4.5rem' : undefined}>
                <IconButton
                  icon={<CopyIcon />}
                  aria-label='copy-icon'
                  size='sm'
                  isRound
                  variant='ghost'
                  onClick={handleCopyClick}
                />
                {state.supportsAddressVerifying && (
                  <IconButton
                    icon={state.shownOnDisplay ? <CheckIcon /> : <ViewIcon />}
                    onClick={handleVerify}
                    aria-label='check-icon'
                    size='sm'
                    color={
                      state.shownOnDisplay
                        ? 'green.500'
                        : state.shownOnDisplay === false
                        ? 'red.500'
                        : 'gray.500'
                    }
                    isRound
                    variant='ghost'
                  />
                )}
              </InputRightElement>
            </InputGroup>
          </Flex>
        )}
        <Button
          width='full'
          size='lg'
          colorScheme='blue'
          disabled={!selectedAsset}
          as='a'
          mt='25px'
          href={makeGemPartnerUrl(fiatRampAction, selectedAsset?.ticker || '', addressFull)}
          target='_blank'
        >
          <Text translation='common.continue' />
        </Button>
        <Button width='full' size='lg' variant='ghost' onClick={fiatRamps.close}>
          <Text translation='common.cancel' />
        </Button>
      </Flex>
    </SlideTransition>
  )
}
