import isBoolean from 'lodash/isBoolean';
import invoke from 'lodash/invoke';
import PropTypes from 'prop-types';
import React from 'react';
import BaseInput, {BaseInputProps, BaseInputState, DateRelatedProps, MinMaxValueProps} from './BaseInput';

import CustomPropTypes from '../lib/CustomPropTypes';
import MonthRangePicker, {MonthRangePickerOnChangeData} from '../pickers/monthPicker/MonthRangePicker';
import InputView from '../views/InputView';
import {MonthInputProps} from './MonthInput';
import {
  getInitializer,
  parseDatesRange,
  parseValue,
} from './parse';

const DATES_SEPARATOR = ' - ';

export type MonthRangeInputProps =
  & BaseInputProps
  & DateRelatedProps
  & MinMaxValueProps;

export interface MonthRangeInputOnChangeData extends MonthInputProps {
  value: string;
  date: MonthRangePickerOnChangeData;
}

class MonthRangeInput extends BaseInput<MonthRangeInputProps, BaseInputState> {
  public static readonly defaultProps = {
    dateFormat: 'MM-YYYY',
    icon: 'calendar',
    inline: false,
  };

  public static readonly propTypes = {
    /** Currently selected value. */
    value: PropTypes.string,
    /** Moment date formatting string. */
    dateFormat: PropTypes.string,
    /** Date to display initially when no date is selected. */
    initialDate: PropTypes.oneOfType([
      PropTypes.string,
      CustomPropTypes.momentObj,
      PropTypes.instanceOf(Date),
    ]),
    /** Maximum date that can be selected. */
    maxDate: PropTypes.oneOfType([
      PropTypes.string,
      CustomPropTypes.momentObj,
      PropTypes.instanceOf(Date),
    ]),
    /** Minimum date that can be selected. */
    minDate: PropTypes.oneOfType([
      PropTypes.string,
      CustomPropTypes.momentObj,
      PropTypes.instanceOf(Date),
    ]),
    /** If true, popup closes after selecting a date-time. */
    closable: PropTypes.bool,
    /**
     * Called on clear.
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props and proposed value.
     */
    onClear: PropTypes.func,
    /** Using the clearable setting will let users remove their selection from a calendar. */
    clearable: PropTypes.bool,
    /** Optional Icon to display inside the clearable Input. */
    clearIcon: PropTypes.any,
    /** Duration of the CSS transition animation in milliseconds. */
    duration: PropTypes.number,
    /** Named animation event to used. Must be defined in CSS. */
    animation: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      popupIsClosed: true,
    };
  }

  public render() {
    const {
      value,
      icon,
      dateFormat,
      initialDate,
      maxDate,
      minDate,
      closable,
      localization,
      ...rest
    } = this.props;

    const {
      start,
      end,
    } = parseDatesRange(value, dateFormat);

    return (
      <InputView
        popupIsClosed={this.state.popupIsClosed}
        icon={isBoolean(icon) && !icon ? undefined : icon}
        {...rest}
        value={value}
        onMount={this.onInputViewMount}
        closePopup={this.closePopup}
        openPopup={this.openPopup}
        render={(pickerProps) =>
          (<MonthRangePicker
            {...pickerProps}
            isPickerInFocus={this.isPickerInFocus}
            isTriggerInFocus={this.isTriggerInFocus}
            inline={this.props.inline}
            onCalendarViewMount={this.onCalendarViewMount}
            closePopup={this.closePopup}
            onChange={this.handleSelect}
            dateFormat={dateFormat}
            initializeWith={getInitializer({initialDate, dateFormat, localization})}
            start={start}
            end={end}
            minDate={parseValue(minDate, dateFormat)}
            maxDate={parseValue(maxDate, dateFormat)}
            localization={localization}/>)
        }
      />
    );
  }

  private handleSelect = (e: React.SyntheticEvent<HTMLElement>,
                          {value}: MonthRangePickerOnChangeData) => {
    const {dateFormat} = this.props;
    const {
      start,
      end,
    } = value;
    let outputString = '';
    if (start && end) {
      outputString = `${start.format(dateFormat)}${DATES_SEPARATOR}${end.format(dateFormat)}`;
    } else if (start) {
      outputString = `${start.format(dateFormat)}${DATES_SEPARATOR}`;
    }

    invoke(this.props, 'onChange', e, {...this.props, value: outputString, date: value});
    if (this.props.closable && start && end) {
      this.closePopup();
    }
  }
}

export default MonthRangeInput;
