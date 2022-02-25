import { Flex, FlexProps } from '@chakra-ui/layout'
import { Input, InputLeftElement, Tag } from '@chakra-ui/react'
import { Asset } from '@shapeshiftoss/types'
import { Field, StakingValues } from 'plugins/cosmos/components/modals/Staking/views/Stake'
import { Control, Controller } from 'react-hook-form'
import NumberFormat from 'react-number-format'
import { useLocaleFormatter } from 'hooks/useLocaleFormatter/useLocaleFormatter'
import { bnOrZero } from 'lib/bignumber/bignumber'

type StakingInputProps = {
  isCryptoField: boolean
  onInputToggle: () => void
  onInputChange: (value: string) => void
  amountRef: string | null
  asset: Asset
  control: Control<StakingValues>
}

const cryptoInputValidation = {
  required: true,
  validate: {
    validateCryptoAmount: (_: string) => {
      // TODO: Implement when we have cosmos/osmosis balance data
      return true
    }
  }
}
const fiatInputValidation = {
  required: true,
  validate: {
    validateFiatAmount: (_: string) => {
      // TODO: Implement when we have cosmos/osmosis balance data
      return true
    }
  }
}
const CryptoInput = (props: any) => (
  <Input
    height='100%'
    pr='4.5rem'
    pl='1rem'
    ml='1rem'
    size='lg'
    type='number'
    border={0}
    borderBottomRadius={0}
    borderTopLeftRadius={0}
    placeholder='Enter amount'
    {...props}
  />
)

export const StakingInput = ({
  asset,
  amountRef,
  control,
  isCryptoField,
  onInputToggle,
  onInputChange,
  ...styleProps
}: StakingInputProps & FlexProps) => {
  const {
    number: { localeParts }
  } = useLocaleFormatter({ fiatType: 'USD' })
  return (
    <Flex bgColor='gray.850' borderRadius='12px' alignItems='center' {...styleProps}>
      <InputLeftElement pos='relative' ml={1} width='auto'>
        <Tag as='button' onClick={onInputToggle} color='gray.500' bgColor='gray.700' mr='12px'>
          {isCryptoField ? asset.symbol : 'USD'}
        </Tag>
      </InputLeftElement>
      {isCryptoField && (
        <Controller
          render={({ field: { onChange, value } }) => {
            return (
              <NumberFormat
                customInput={CryptoInput}
                isNumericString={true}
                decimalSeparator={localeParts.decimal}
                inputMode='decimal'
                thousandSeparator={localeParts.group}
                value={value}
                onChange={e => {
                  onChange(amountRef)
                  onInputChange(amountRef as string)
                  amountRef = null
                }}
                onValueChange={e => {
                  amountRef = e.value
                }}
              />
            )
          }}
          name={Field.CryptoAmount}
          control={control}
          rules={cryptoInputValidation}
        />
      )}
      {!isCryptoField && (
        <Controller
          render={({ field: { onChange, value } }) => {
            return (
              <NumberFormat
                customInput={CryptoInput}
                isNumericString={true}
                decimalSeparator={localeParts.decimal}
                inputMode='decimal'
                thousandSeparator={localeParts.group}
                value={bnOrZero(value).toFixed(2)}
                onChange={e => {
                  onChange(amountRef)
                  onInputChange(amountRef as string)
                  amountRef = null
                }}
                onValueChange={e => {
                  amountRef = e.value
                }}
              />
            )
          }}
          name={Field.FiatAmount}
          control={control}
          rules={fiatInputValidation}
        />
      )}
    </Flex>
  )
}
