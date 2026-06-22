import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: `'Fredoka', 'Nunito', sans-serif`,
    body: `'Nunito', sans-serif`,
  },
  colors: {
    playful: {
      50: '#E8F7FF',
      100: '#CCEBFF',
      200: '#99D6FF',
      300: '#66C2FF',
      400: '#33ADFF',
      500: '#0099FF',
      600: '#007ACC',
      700: '#005C99',
    },
    sunshine: {
      50: '#FFFBE6',
      100: '#FFF3BF',
      200: '#FFEC99',
      300: '#FFE066',
      400: '#FFD43B',
      500: '#FCC419',
      600: '#FAB005',
    },
    bubblegum: {
      50: '#FFF0F6',
      100: '#FFD6E8',
      200: '#FFB3D1',
      300: '#FF8CB8',
      400: '#FF6BA8',
      500: '#FF4D94',
      600: '#E6367A',
    },
    mint: {
      50: '#E6FCF5',
      100: '#C3FAE8',
      200: '#96F2D7',
      300: '#63E6BE',
      400: '#38D9A9',
      500: '#20C997',
      600: '#12B886',
    },
    grape: {
      50: '#F3F0FF',
      100: '#E5DBFF',
      200: '#D0BFFF',
      300: '#B197FC',
      400: '#9775FA',
      500: '#845EF7',
      600: '#7048E8',
    },
    cream: {
      50: '#FFFBF5',
      100: '#FFF4E6',
      200: '#FFE8CC',
    },
    navy: {
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
  },
  radii: {
    fun: '1.25rem',
    blob: '2rem',
  },
  shadows: {
    fun: '0 8px 24px rgba(0, 153, 255, 0.15)',
    card: '0 4px 20px rgba(52, 58, 64, 0.08)',
    pop: '0 6px 0 0 rgba(0, 0, 0, 0.12)',
  },
  styles: {
    global: {
      body: {
        bg: 'cream.50',
        color: 'navy.800',
      },
      '#root': {
        minH: '100vh',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '700',
        borderRadius: 'full',
        letterSpacing: '0.02em',
        transition: 'all 0.2s ease',
        _focus: {
          boxShadow: '0 0 0 3px rgba(0, 153, 255, 0.35)',
        },
      },
      variants: {
        solid: (props) => {
          const { colorScheme: c } = props;
          const isLight = c === 'sunshine';
          return {
            bg: `${c}.500`,
            color: isLight ? 'navy.800' : 'white',
            boxShadow: 'pop',
            _hover: {
              bg: `${c}.600`,
              transform: 'translateY(-2px)',
              boxShadow: 'fun',
              color: isLight ? 'navy.900' : 'white',
            },
            _active: {
              transform: 'translateY(2px)',
              boxShadow: 'none',
            },
          };
        },
        outline: (props) => {
          const { colorScheme: c } = props;
          return {
            border: '3px solid',
            borderColor: `${c}.400`,
            color: `${c}.700`,
            bg: 'white',
            _hover: {
              bg: `${c}.50`,
              transform: 'translateY(-1px)',
            },
          };
        },
        ghost: {
          color: 'navy.700',
          _hover: {
            bg: 'playful.50',
            color: 'playful.700',
          },
        },
        fun: {
          bg: 'linear-gradient(135deg, playful.400 0%, grape.400 100%)',
          color: 'white',
          boxShadow: 'fun',
          _hover: {
            bg: 'linear-gradient(135deg, playful.500 0%, grape.500 100%)',
            transform: 'scale(1.03)',
          },
        },
      },
      defaultProps: {
        colorScheme: 'playful',
        variant: 'solid',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'playful.400',
      },
      variants: {
        fun: {
          field: {
            borderRadius: 'fun',
            border: '3px solid',
            borderColor: 'playful.100',
            bg: 'white',
            fontWeight: '600',
            _hover: { borderColor: 'playful.200' },
            _focus: {
              borderColor: 'playful.400',
              boxShadow: '0 0 0 3px rgba(0, 153, 255, 0.2)',
            },
          },
        },
      },
      baseStyle: {
        field: {
          borderRadius: 'fun',
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'playful.400',
      },
      baseStyle: {
        borderRadius: 'fun',
        border: '3px solid',
        borderColor: 'playful.100',
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'playful.400',
      },
      baseStyle: {
        field: {
          borderRadius: 'fun',
          border: '3px solid',
          borderColor: 'playful.100',
          fontWeight: '600',
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
        fontWeight: '700',
        textTransform: 'none',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        color: 'navy.800',
        letterSpacing: '-0.02em',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'blob',
          overflow: 'hidden',
        },
      },
    },
  },
});

export default theme;
