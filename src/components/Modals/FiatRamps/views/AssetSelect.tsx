import { ArrowBackIcon } from '@chakra-ui/icons'
import { Flex, IconButton, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { selectPortfolioMixedHumanBalancesBySymbol } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { AssetSearch } from '../components/AssetSearch/AssetSearch'
import { FiatRampAction } from '../const'
import {
  fetchCoinifySupportedCurrencies,
  fetchWyreSupportedCurrencies,
  parseGemBuyAssets,
  parseGemSellAssets
} from '../utils'

export const AssetSelect = ({
  supportsBtc,
  selectAssetTranslation,
  setIsSelectingAsset,
  onAssetSelect
}) => {
  const history = useHistory()
  const { fiatRampAction } = useParams()
  const [buyList, setBuyList] = useState<any>([])
  const [sellList, setSellList] = useState<any>([])
  const [coinifyAssets, setCoinifyAssets] = useState<any>([])
  const [wyreAssets, setWyreAssets] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const onArrowClick = () => {
    history.goBack()
  }

  const balances = useAppSelector(selectPortfolioMixedHumanBalancesBySymbol)

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      if (!coinifyAssets.length) {
        const coinifyAssets = await fetchCoinifySupportedCurrencies()
        setCoinifyAssets(coinifyAssets)
      }
      if (!wyreAssets.length) {
        const wyreAssets = await fetchWyreSupportedCurrencies()
        setWyreAssets(wyreAssets)
      }

      if (coinifyAssets.length && wyreAssets.length) {
        const buyList = parseGemBuyAssets(supportsBtc, coinifyAssets, wyreAssets, balances)

        if (!buyList.length) return
        setBuyList(buyList)

        const sellList = parseGemSellAssets(supportsBtc, coinifyAssets, wyreAssets, balances)
        if (!sellList.length) return
        setSellList(sellList)

        setLoading(false)
      }
    })()
  }, [supportsBtc, coinifyAssets, wyreAssets, balances])

  return (
    <SlideTransition>
      <Stack>
        <Flex>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label={selectAssetTranslation}
            size='sm'
            onClick={() => onArrowClick()}
            isRound
            variant='ghost'
            mr={2}
          />
          <Text alignSelf='center' translation={selectAssetTranslation} />
        </Flex>
        <AssetSearch
          onClick={onAssetSelect}
          type={fiatRampAction}
          assets={fiatRampAction === FiatRampAction.Buy ? buyList : sellList}
          loading={loading}
        />
      </Stack>
    </SlideTransition>
  )
}
