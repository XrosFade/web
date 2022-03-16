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
import { ChainTypes, UtxoAccountType } from '@shapeshiftoss/types'
import { useEffect, useMemo, useReducer } from 'react'
import { useTranslate } from 'react-polyglot'
import { useHistory, useLocation } from 'react-router'
import { AssetIcon } from 'components/AssetIcon'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useChainAdapters } from 'context/ChainAdaptersProvider/ChainAdaptersProvider'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useWallet } from 'context/WalletProvider/WalletProvider'
import { ensReverseLookup } from 'lib/ens'

import { FiatRampActionButtons } from '../components/FiatRampActionButtons'
import { BTC_SEGWIT_NATIVE_BIP44, FiatRampAction, GemManagerAction } from '../const'
import { GemCurrency } from '../FiatRamps'
import { reducer } from '../reducer'
import { initialState } from '../state'
import { getAssetLogoUrl, makeGemPartnerUrl, middleEllipsis } from '../utils'

export const GemManager = () => {
  const translate = useTranslate()
  const history = useHistory()
  const location = useLocation()
  console.log({ location })
  const toast = useToast()
  const { fiatRamps } = useModal()

  const [state, dispatch] = useReducer(reducer, initialState)
  const setIsSelectingAsset = () => {
    const route = state.fiatRampAction === FiatRampAction.Buy ? '/buy/select' : '/sell/select'
    history.push(route, {
      selectAssetTranslation,
      setIsSelectingAsset,
      onAssetSelect
    })
  }

  const setFiatRampAction = (fiatRampAction: FiatRampAction) => {
    return dispatch({ type: GemManagerAction.SET_FIAT_RAMP_ACTION, fiatRampAction })
  }

  const {
    state: { wallet }
  } = useWallet()
  const chainAdapterManager = useChainAdapters()
  const ethChainAdapter = chainAdapterManager.byChain(ChainTypes.Ethereum)
  const btcChainAdapter = chainAdapterManager.byChain(ChainTypes.Bitcoin)

  const addressOrNameFull = state.isBTC ? state.btcAddress : state.ensName || state.ethAddress

  const addressFull = state.isBTC ? state.btcAddress : state.ethAddress

  const addressOrNameEllipsed =
    state.isBTC && state.btcAddress
      ? middleEllipsis(state.btcAddress, 11)
      : state.ensName || middleEllipsis(state.ethAddress || '', 11)

  useEffect(() => {
    ;(async () => {
      dispatch({ type: GemManagerAction.SET_SUPPORTS_ADDRESS_VERIFYING, wallet })
    })()
  }, [wallet])

  useEffect(() => {
    ;(async () => {
      if (!wallet) return
      if (!state.ethAddress) {
        const ethAddress = await ethChainAdapter.getAddress({
          wallet
        })
        dispatch({ type: GemManagerAction.SET_ETH_ADDRESS, ethAddress })
      }
      if (wallet && !state.btcAddress) {
        const btcAddress =
          wallet && supportsBTC(wallet)
            ? await btcChainAdapter.getAddress({
                wallet,
                accountType: UtxoAccountType.SegwitNative,
                bip44Params: BTC_SEGWIT_NATIVE_BIP44
              })
            : ''
        dispatch({ type: GemManagerAction.SET_BTC_ADDRESS, btcAddress })
      }

      if (state.ethAddress && !state.ensName) {
        const reverseEthAddressLookup = await ensReverseLookup(state.ethAddress)
        !reverseEthAddressLookup.error &&
          dispatch({ type: GemManagerAction.SET_ENS_NAME, ensName: reverseEthAddressLookup.name })
      }
    })()
  }, [
    state.isBTC,
    state.chainAdapter,
    state.ensName,
    state.ethAddress,
    state.btcAddress,
    wallet,
    ethChainAdapter,
    btcChainAdapter
  ])

  useEffect(() => {
    if (location.state?.selectedAsset?.ticker) {
      dispatch({
        type: GemManagerAction.SET_IS_BTC,
        assetTicker: location.state.selectedAsset?.ticker,
        btcAddress: state.btcAddress
      })

      const chainAdapter =
        wallet && state.isBTC && supportsBTC(wallet) ? btcChainAdapter : ethChainAdapter

      dispatch({
        type: GemManagerAction.SET_CHAIN_ADAPTER,
        chainAdapter: chainAdapter
      })
    }
  }, [btcChainAdapter, ethChainAdapter, wallet, state.isBTC, state.btcAddress])

  const [selectAssetTranslation, assetTranslation, fundsTranslation] = useMemo(
    () =>
      state.fiatRampAction === FiatRampAction.Buy
        ? ['fiatRamps.selectAnAssetToBuy', 'fiatRamps.assetToBuy', 'fiatRamps.fundsTo']
        : ['fiatRamps.selectAnAssetToSell', 'fiatRamps.assetToSell', 'fiatRamps.fundsFrom'],
    [state.fiatRampAction]
  )

  const onAssetSelect = (data: GemCurrency) => {
    const route = state.fiatRampAction === FiatRampAction.Buy ? '/buy' : '/sell'

    history.push(route, {
      selectedAsset: data,
      // Reset shown on display status
      shownOnDisplay: null
    })
  }

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
      ...(state.isBTC
        ? {
            accountType: UtxoAccountType.SegwitNative,
            bip44Params: BTC_SEGWIT_NATIVE_BIP44
          }
        : {}),
      showOnDevice: true
    })

    const shownOnDisplay =
      Boolean(deviceAddress) &&
      (deviceAddress === state.ethAddress || deviceAddress === state.btcAddress)

    console.log({ shownOnDisplay })
  }

  return (
    <SlideTransition>
      <Flex direction='column'>
        <FiatRampActionButtons action={state.fiatRampAction} setAction={setFiatRampAction} />
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
          onClick={() => setIsSelectingAsset()}
          rightIcon={<ChevronRightIcon color='gray.500' boxSize={6} />}
        >
          {location?.state?.selectedAsset ? (
            <Flex alignItems='center'>
              <AssetIcon src={getAssetLogoUrl(location.state?.selectedAsset)} mr={4} />
              <Box textAlign='left'>
                <RawText lineHeight={1}>{location.state?.selectedAsset.name}</RawText>
                <RawText fontWeight='normal' fontSize='sm' color='gray.500'>
                  {location.state?.selectedAsset?.ticker}
                </RawText>
              </Box>
            </Flex>
          ) : (
            <Text translation={selectAssetTranslation} color='gray.500' />
          )}
        </Button>
        {location.state?.selectedAsset && (
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
          disabled={!location.state?.selectedAsset}
          as='a'
          mt='25px'
          href={makeGemPartnerUrl(
            state.fiatRampAction,
            location.state?.selectedAsset?.ticker || '',
            addressFull
          )}
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
