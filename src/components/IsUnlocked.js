// @flow

import bcrypt from 'bcryptjs'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import styled from 'styled-components'
import { translate } from 'react-i18next'
import type { Account } from '@ledgerhq/wallet-common/lib/types'

import type { Settings, T } from 'types/common'
import IconLockScreen from 'icons/LockScreen'

import { ErrorMessageInput } from 'components/base/Input'

import get from 'lodash/get'

import {
  startSyncCounterValues,
  startSyncAccounts,
  stopSyncAccounts,
  stopSyncCounterValues,
} from 'renderer/events'
import { setEncryptionKey } from 'helpers/db'

import { fetchAccounts } from 'actions/accounts'
import { getAccounts } from 'reducers/accounts'
import { isLocked, unlock } from 'reducers/application'
import { getCounterValueCode } from 'reducers/settings'

import Box from 'components/base/Box'
import InputPassword from 'components/base/InputPassword'

type InputValue = {
  password: string,
}

type Props = {
  accounts: Account[],
  children: any,
  counterValue: string,
  fetchAccounts: Function,
  isLocked: boolean,
  settings: Settings,
  t: T,
  unlock: Function,
}
type State = {
  inputValue: InputValue,
  incorrectPassword: boolean,
}

const mapStateToProps = state => ({
  accounts: getAccounts(state),
  counterValue: getCounterValueCode(state),
  isLocked: isLocked(state),
  settings: state.settings,
})

const mapDispatchToProps: Object = {
  fetchAccounts,
  unlock,
}

const defaultState = {
  inputValue: {
    password: '',
  },
  incorrectPassword: false,
}

export const PageTitle = styled(Box).attrs({
  width: '152px',
  height: '27px',
  fontFamily: 'MuseoSans',
  fontSize: '22px',
  color: '#1d2028',
})``

export const LockScreenDesc = styled(Box).attrs({
  width: '340px',
  height: '36px',
  fontFamily: 'OpenSans',
  fontSize: '13px',
  textAlign: 'center',
  color: '#666',
})`
  margin: 10px auto 25px;
`
class IsUnlocked extends Component<Props, State> {
  state = {
    ...defaultState,
  }

  componentWillMount() {
    if (this.props.isLocked) {
      stopSyncCounterValues()
      stopSyncAccounts()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isLocked && !nextProps.isLocked) {
      startSyncCounterValues(nextProps.counterValue, nextProps.accounts)
      startSyncAccounts(nextProps.accounts)
    }

    if (!this.props.isLocked && nextProps.isLocked) {
      stopSyncCounterValues()
      stopSyncAccounts()
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isLocked) {
      return true
    }

    if (!nextProps.isLocked && this.props.isLocked) {
      return true
    }

    return nextProps.children !== this.props.children
  }

  handleChangeInput = (key: $Keys<InputValue>) => (value: $Values<InputValue>) =>
    this.setState(prev => ({
      inputValue: {
        ...prev.inputValue,
        [key]: value,
      },
    }))

  handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { settings, unlock, fetchAccounts } = this.props
    const { inputValue } = this.state

    if (bcrypt.compareSync(inputValue.password, get(settings, 'password.value'))) {
      setEncryptionKey('accounts', inputValue.password)
      await fetchAccounts()
      unlock()

      this.setState({
        ...defaultState,
      })
    } else {
      this.setState({ incorrectPassword: true })
    }
  }

  handleFocusInput = () => {
    if (this._input && this._input !== null) {
      this._input.focus()
    }
  }

  _input: ?HTMLInputElement

  render() {
    const { inputValue, incorrectPassword } = this.state
    const { isLocked, t } = this.props

    if (isLocked) {
      return (
        <Box sticky alignItems="center" justifyContent="center" onClick={this.handleFocusInput}>
          <form onSubmit={this.handleSubmit}>
            <Box align="center">
              <IconLockScreen size={136} />
              <PageTitle>{t('common:lockScreen.title')}</PageTitle>
              <LockScreenDesc>
                {t('common:lockScreen.subTitle')}
                <br />
                {t('common:lockScreen.description')}
              </LockScreenDesc>
              <Box style={{ minWidth: '230px' }}>
                <InputPassword
                  autoFocus
                  innerRef={(n: any) => (this._input = n)}
                  placeholder={t('common:lockScreen.inputPlaceholder')}
                  type="password"
                  onChange={this.handleChangeInput('password')}
                  value={inputValue.password}
                />
                {incorrectPassword && (
                  <ErrorMessageInput>
                    {t('password:errorMessageIncorrectPassword')}
                  </ErrorMessageInput>
                )}
              </Box>
            </Box>
          </form>
        </Box>
      )
    }

    return this.props.children
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps, null, {
    pure: false,
  }),
  translate(),
)(IsUnlocked)
