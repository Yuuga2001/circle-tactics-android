import React from 'react';
import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CellState } from '../types';
import { CELL_SIZE, COLORS } from '../styles/theme';
import Piece from './Piece';

interface CellProps {
  row: number;
  col: number;
  cell: CellState;
  onPress: () => void;
  isWinning?: boolean;
  isValid?: boolean;
  cellSize?: number;
}

const Cell: React.FC<CellProps> = ({
  row,
  col,
  cell,
  onPress,
  isWinning = false,
  isValid = false,
  cellSize = CELL_SIZE,
}) => {
  const getBorderColor = () => {
    if (isWinning) return '#f1c40f';
    if (isValid) return '#2ecc71';
    return COLORS.border;
  };

  const getBackgroundColor = () => {
    if (isWinning) return 'rgba(241,196,15,0.15)';
    if (isValid) return 'rgba(46,204,113,0.1)';
    return COLORS.surface;
  };

  const containerStyle: ViewStyle = {
    width: cellSize,
    height: cellSize,
    borderWidth: 1.5,
    borderColor: getBorderColor(),
    backgroundColor: getBackgroundColor(),
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <TouchableOpacity
      testID={`cell-${row}-${col}`}
      onPress={onPress}
      style={containerStyle}
      activeOpacity={0.7}
    >
      <View style={styles.pieceContainer} pointerEvents="none">
        {/* Render pieces from largest to smallest so smaller pieces appear on top */}
        {cell[2] && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.centered}>
              <Piece player={cell[2].player} size="LARGE" testID={`piece-${row}-${col}-large`} />
            </View>
          </View>
        )}
        {cell[1] && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.centered}>
              <Piece player={cell[1].player} size="MEDIUM" testID={`piece-${row}-${col}-medium`} />
            </View>
          </View>
        )}
        {cell[0] && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.centered}>
              <Piece player={cell[0].player} size="SMALL" testID={`piece-${row}-${col}-small`} />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pieceContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Cell;
