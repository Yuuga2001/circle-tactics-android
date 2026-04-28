import React from 'react';
import { render } from '@testing-library/react-native';
import Piece from '../../../src/components/Piece';
import { PLAYER_COLORS, PIECE_SIZE_RATIO } from '../../../src/styles/theme';

describe('Piece', () => {
  it('REDプレイヤーのSMALLピースが表示される', () => {
    const { getByTestId } = render(<Piece player="RED" size="SMALL" cellSize={72} testID="piece" />);
    expect(getByTestId('piece')).toBeTruthy();
  });

  it('BLUEプレイヤーのMEDIUMピースが表示される', () => {
    const { getByTestId } = render(<Piece player="BLUE" size="MEDIUM" cellSize={72} testID="piece-blue" />);
    expect(getByTestId('piece-blue')).toBeTruthy();
  });

  it('REDプレイヤーのpiececは赤色を持つ', () => {
    const { getByTestId } = render(<Piece player="RED" size="LARGE" cellSize={72} testID="piece-red" />);
    const element = getByTestId('piece-red');
    const style = element.props.style;
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style.map((s: object) => s || {})) : style;
    expect(flatStyle.backgroundColor).toBe(PLAYER_COLORS.RED);
  });

  it('BLUEプレイヤーのpiececは青色を持つ', () => {
    const { getByTestId } = render(<Piece player="BLUE" size="SMALL" cellSize={72} testID="piece-blue" />);
    const element = getByTestId('piece-blue');
    const style = element.props.style;
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style.map((s: object) => s || {})) : style;
    expect(flatStyle.backgroundColor).toBe(PLAYER_COLORS.BLUE);
  });

  it('SMALLサイズは適切なサイズを持つ', () => {
    // Cell passes cellSize - 4 = 68 to Piece, so we do the same here
    const { getByTestId } = render(<Piece player="RED" size="SMALL" cellSize={68} testID="piece-small" />);
    const element = getByTestId('piece-small');
    const style = element.props.style;
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style.map((s: object) => s || {})) : style;
    const expectedSize = 68 * PIECE_SIZE_RATIO.SMALL;
    expect(flatStyle.width).toBe(expectedSize);
    expect(flatStyle.height).toBe(expectedSize);
  });

  it('LARGEサイズは適切なサイズを持つ', () => {
    // Cell passes cellSize - 4 = 68 to Piece, so we do the same here
    const { getByTestId } = render(<Piece player="GREEN" size="LARGE" cellSize={68} testID="piece-large" />);
    const element = getByTestId('piece-large');
    const style = element.props.style;
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style.map((s: object) => s || {})) : style;
    const expectedSize = 68 * PIECE_SIZE_RATIO.LARGE;
    expect(flatStyle.width).toBe(expectedSize);
    expect(flatStyle.height).toBe(expectedSize);
  });

  it('円形（borderRadius）が設定されている', () => {
    const { getByTestId } = render(<Piece player="YELLOW" size="MEDIUM" cellSize={72} testID="piece-circle" />);
    const element = getByTestId('piece-circle');
    const style = element.props.style;
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style.map((s: object) => s || {})) : style;
    expect(flatStyle.borderRadius).toBeDefined();
    expect(flatStyle.borderRadius).toBeGreaterThan(0);
  });
});
