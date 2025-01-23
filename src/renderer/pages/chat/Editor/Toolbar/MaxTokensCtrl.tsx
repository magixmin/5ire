import {
  Button,
  Field,
  SpinButton,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
  PopoverProps,
} from '@fluentui/react-components';
import Mousetrap from 'mousetrap';
import {
  bundleIcon,
  NumberSymbolSquare20Filled,
  NumberSymbolSquare20Regular,
} from '@fluentui/react-icons';
import Debug from 'debug';
import { IChat, IChatContext } from 'intellichat/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useChatStore from 'stores/useChatStore';
import { str2int } from 'utils/util';

const debug = Debug('5ire:pages:chat:Editor:Toolbar:MaxTokensCtrl');

const NumberSymbolSquareIcon = bundleIcon(
  NumberSymbolSquare20Filled,
  NumberSymbolSquare20Regular
);

export default function MaxTokens({
  ctx,
  chat,
  onConfirm,
}: {
  ctx: IChatContext;
  chat:IChat,
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const updateChat = useChatStore((state) => state.updateChat);
  const editChat = useChatStore((state) => state.editChat);

  const [maxTokens, setMaxTokens] = useState<number | null>(null);

  useEffect(() => {
    Mousetrap.bind('mod+shift+4', () => {
      setOpen(prevOpen => {
        return !prevOpen;
      });
    });
    setMaxTokens(ctx.getMaxTokens());
    return () => {
      Mousetrap.unbind('mod+shift+4');
    };
  }, [chat.id]);



  const handleOpenChange: PopoverProps['onOpenChange'] = (e, data) =>
    setOpen(data.open || false);

  const updateMaxTokens = (
    ev: SpinButtonChangeEvent,
    data: SpinButtonOnChangeData
  ) => {
    const $maxToken = data.value
      ? data.value
      : str2int(data.displayValue as string);
    if (chat.isPersisted) {
      updateChat({ id: chat.id, maxTokens: $maxToken });
      debug('Update MaxTokens of Chat', $maxToken);
    } else {
      editChat({ maxTokens: $maxToken });
      debug('Edit MaxTokens of Chat', $maxToken);
    }
    setMaxTokens($maxToken);
    setOpen(false);
    onConfirm();
    window.electron.ingestEvent([{ app: 'modify-max-tokens' }]);
  };


  return (
    <Popover open={open} trapFocus withArrow onOpenChange={handleOpenChange}>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          size="small"
          title="Mod+Shift+4"
          aria-label={t('Common.MaxTokens')}
          appearance="subtle"
          icon={<NumberSymbolSquareIcon />}
          className="justify-start text-color-secondary flex-shrink-0"
          style={{ padding: 1, minWidth: 20, borderColor:'transparent', boxShadow:'none' }}
        >
          {maxTokens || null}
        </Button>
      </PopoverTrigger>
      <PopoverSurface aria-labelledby="temperature">
        <div className="w-64">
          <Field label={t('Common.MaxTokens')} style={{borderColor: 'transparent', boxShadow: 'none'}}>
            <SpinButton
              precision={9}
              step={10}
              value={maxTokens}
              min={1}
              id="maxTokens"
              placeholder={t('Common.Unlimited')}
              onChange={updateMaxTokens}
            />
          </Field>
          <div className="mt-1.5 text-xs tips">
            {t(
              `Toolbar.Tip.MaxTokens`,
            )}
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
}
