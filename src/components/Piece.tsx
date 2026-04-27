import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Player, PieceSize } from '../types';
import { PLAYER_COLORS, PLAYER_BORDER_COLORS, PIECE_SIZE_RATIO, CELL_SIZE } from '../styles/theme';

interface PieceProps {
  player: Player;
  size: PieceSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const Piece: React.FC<PieceProps> = ({ player, size, style, testID }) => {
  const diameter = CELL_SIZE * PIECE_SIZE_RATIO[size];
  const pieceStyle: ViewStyle = {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    backgroundColor: PLAYER_COLORS[player],
    borderWidth: 2,
    borderColor: PLAYER_BORDER_COLORS[player],
  };

  return (
    <View
      testID={testID}
      style={[pieceStyle, style]}
    />
  );
};

export default Piece;
