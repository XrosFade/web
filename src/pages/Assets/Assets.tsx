import { Asset } from '@shapeshiftoss/types'
import { useHistory } from 'react-router-dom'
import { AssetSearch } from 'components/AssetSearch/AssetSearch'
import { Main } from 'components/Layout/Main'

export const Assets = () => {
  const history = useHistory()
  const onClick = (asset: Asset) => {
    // CAIP19 has a `/` separator so the router will have to parse 2 variables
    // e.g., /assets/:chainId/:assetSubId
    const url = `/assets/${asset.caip19}`
    history.push(url)
  }
  return (
    <Main display='flex' flexDir='column' height='100vh'>
      <AssetSearch onClick={onClick} />
    </Main>
  )
}
