import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from './page.module.css';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { STATUS_CONFIG } from '@/lib/types';

import UniqueIdForm from './UniqueIdForm';
import PreviewUrlForm from './PreviewUrlForm';
import StatusActions from './StatusActions';
import RevisionCompleteButton from './RevisionCompleteButton';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect('/');

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      detail: true,
      client: { select: { email: true, displayName: true } },
      menuItems: {
        orderBy: { sortOrder: 'asc' },
        include: { assets: true },
      },
      snsLinks: true,
      revisions: { orderBy: { createdAt: 'asc' } },
      assets: true,
    },
  });

  if (!project) notFound();

  const isAdmin = user.role === 'admin';

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/projects" className={styles.back}>
          ← 案件一覧へ戻る
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>{project.detail?.storeName ?? '（未設定）'}</h1>
          <span
            className={styles.statusBadge}
            style={{
              color: STATUS_CONFIG[project.status].color,
              backgroundColor: STATUS_CONFIG[project.status].bgColor,
            }}
          >
            {STATUS_CONFIG[project.status].label}
          </span>
        </div>

        {/* 基本情報 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>基本情報</h2>
          <dl className={styles.infoGrid}>
            <dt>ユニークID</dt>
            <dd>{project.uniqueId ?? '未登録'}</dd>
            <dt>代表者名</dt>
            <dd>{project.detail?.repName ?? '-'}</dd>
            <dt>電話番号</dt>
            <dd>{project.detail?.phone ?? '-'}</dd>
            <dt>住所</dt>
            <dd>{project.detail?.address ?? '-'}</dd>
            <dt>最寄駅</dt>
            <dd>{project.detail?.nearestStation || '-'}</dd>
            <dt>営業時間</dt>
            <dd>{project.detail?.businessHours || '-'}</dd>
            <dt>定休日</dt>
            <dd>{project.detail?.holidays || '-'}</dd>
            <dt>依頼者アカウント</dt>
            <dd>
              {project.client.displayName} ({project.client.email})
            </dd>
            <dt>依頼日</dt>
            <dd>{project.createdAt.toLocaleDateString('ja-JP')}</dd>
          </dl>
          {project.detail?.otherInfo && <p className={styles.otherInfo}>{project.detail.otherInfo}</p>}
        </section>

        {/* SNS */}
        {project.snsLinks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>SNS / 既存ウェブサイト</h2>
            <ul className={styles.snsList}>
              {project.snsLinks.map((sns) => (
                <li key={sns.id}>
                  <span className={styles.snsPlatform}>{sns.platform}</span>
                  <a href={sns.url} target="_blank" rel="noopener noreferrer">
                    {sns.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* メニュー / プラン */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>メニュー / プラン</h2>
          {project.menuItems.length > 0 ? (
            <div className={styles.menuList}>
              {project.menuItems.map((menu) => (
                <div key={menu.id} className={styles.menuItem}>
                  <div className={styles.menuHeader}>
                    <span className={styles.menuName}>{menu.name}</span>
                    {menu.priceText && <span className={styles.menuPrice}>{menu.priceText}</span>}
                  </div>
                  {menu.description && <p className={styles.menuDescription}>{menu.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>メニューが登録されていません。</p>
          )}
        </section>

        {/* 写真素材 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>写真素材</h2>

          {/* ロゴ */}
          <div className={styles.assetGroup}>
            <h3 className={styles.assetLabel}>ロゴ</h3>
            {project.assets.filter((a) => a.kind === 'logo').length > 0 ? (
              <div className={styles.assetGrid}>
                {project.assets
                  .filter((a) => a.kind === 'logo')
                  .map((asset) => (
                    <a key={asset.id} href={asset.blobUrl} target="_blank" rel="noopener noreferrer" className={styles.assetItem}>
                      <img src={asset.blobUrl} alt="ロゴ" className={styles.assetImg} />
                    </a>
                  ))}
              </div>
            ) : (
              <p className={styles.empty}>ロゴは登録されていません。</p>
            )}
          </div>

          {/* メニュー写真 */}
          <div className={styles.assetGroup}>
            <h3 className={styles.assetLabel}>メニュー写真</h3>
            {project.menuItems.some((m) => m.assets.length > 0) ? (
              project.menuItems.map(
                (menu) =>
                  menu.assets.length > 0 && (
                    <div key={menu.id} className={styles.menuAssetRow}>
                      <p className={styles.menuAssetName}>{menu.name}</p>
                      <div className={styles.assetGrid}>
                        {menu.assets.map((asset) => (
                          <a key={asset.id} href={asset.blobUrl} target="_blank" rel="noopener noreferrer" className={styles.assetItem}>
                            <img src={asset.blobUrl} alt={menu.name} className={styles.assetImg} />
                          </a>
                        ))}
                      </div>
                    </div>
                  ),
              )
            ) : (
              <p className={styles.empty}>メニュー写真は登録されていません。</p>
            )}
          </div>

          {/* その他の素材 */}
          <div className={styles.assetGroup}>
            <h3 className={styles.assetLabel}>その他の素材</h3>
            {project.assets.filter((a) => a.kind === 'other').length > 0 ? (
              <div className={styles.assetGrid}>
                {project.assets
                  .filter((a) => a.kind === 'other')
                  .map((asset) => (
                    <a key={asset.id} href={asset.blobUrl} target="_blank" rel="noopener noreferrer" className={styles.assetItem}>
                      <img src={asset.blobUrl} alt="素材" className={styles.assetImg} />
                    </a>
                  ))}
              </div>
            ) : (
              <p className={styles.empty}>その他の素材は登録されていません。</p>
            )}
          </div>
        </section>

        {/* 初稿URL */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>初稿プレビュー</h2>
          {project.previewUrl ? (
            <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
              {project.previewUrl} ↗
            </a>
          ) : (
            <p className={styles.empty}>まだ初稿が登録されていません。</p>
          )}
        </section>

        {/* 修正履歴 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>修正履歴</h2>
          {project.revisions.length > 0 ? (
            <ul className={styles.revisionList}>
              {project.revisions.map((rev) => (
                <li key={rev.id} className={styles.revisionItem}>
                  <div className={styles.revisionHeader}>
                    <span className={styles.revisionNo}>
                      修正依頼 {rev.seqNo}回目 （{rev.phase === 'pre' ? '公開前' : '公開後'}）
                    </span>
                    <span className={`${styles.revisionStatus} ${rev.status === 'done' ? styles.revisionDone : styles.revisionOpen}`}>{rev.status === 'done' ? '対応済み' : '対応中'}</span>
                  </div>
                  {rev.targetArea && <p className={styles.revisionArea}>該当箇所: {rev.targetArea}</p>}
                  <p className={styles.revisionContent}>{rev.content}</p>
                  <p className={styles.revisionDate}>{rev.createdAt.toLocaleDateString('ja-JP')}</p>
                  {isAdmin && rev.status === 'open' && <RevisionCompleteButton projectId={project.id} revisionId={rev.id} />}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>修正履歴はありません。</p>
          )}
        </section>

        {/* 操作エリア（管理のみ）は次の段階で追加 */}
        {isAdmin && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>操作</h2>

            <UniqueIdForm projectId={project.id} currentValue={project.uniqueId} />

            {(project.status === 'waiting' || project.status === 'in_production') && <PreviewUrlForm projectId={project.id} currentValue={project.previewUrl} />}

            <StatusActions projectId={project.id} status={project.status} />
          </section>
        )}
      </div>
    </main>
  );
}
